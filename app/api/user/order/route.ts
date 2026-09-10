import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

interface JwtPayload {
  id: number;
}

interface Order extends RowDataPacket {
  id: number;
  order_no: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_status: string;
  order_status: string;
  ordered_at: string;
}


interface Product extends RowDataPacket {
  id: number;
  price: number;
}

interface Customer extends RowDataPacket {
  id: number;
  name: string;
  email: string | null;
  phone: string;
}


export async function POST(req: NextRequest) {
  const connection = await db.getConnection();

  try {
    const token = req.cookies.get("user_token")?.value;

    const { shipping, shippingRate, shippingLocation, couponDiscount, cart } = await req.json();

    if (!cart?.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart is empty.",
        },
        { status: 400 }
      );
    }

    if (!shipping?.phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Validate phone
    // --------------------------------------------------

    const phone = String(shipping.phone).replace(/[\s-]/g, "");

    // Accept international or local numeric phone numbers
    if (!/^\+?\d{8,15}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid phone number.",
        },
        { status: 400 }
      );
    }

    await connection.beginTransaction();

    // --------------------------------------------------
    // Get / Create Customer
    // --------------------------------------------------

    let userId: number;

    if (token) {
      // -----------------------------------------------
      // Logged-in user
      // -----------------------------------------------

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as JwtPayload;

        if (!decoded.id) {
          await connection.rollback();

          return NextResponse.json(
            {
              success: false,
              message: "Invalid authentication token.",
            },
            { status: 401 }
          );
        }

        userId = Number(decoded.id);
      } catch (error) {
        await connection.rollback();

        return NextResponse.json(
          {
            success: false,
            message: "Invalid authentication token.",
          },
          { status: 401 }
        );
      }
    } else {
      // -----------------------------------------------
      // Guest checkout
      // -----------------------------------------------

      const [existingCustomers] =
        await connection.query<Customer[]>(
          `
          SELECT id, name, email, phone
          FROM customers
          WHERE phone = ?
          LIMIT 1
          `,
          [phone]
        );

      if (existingCustomers.length) {
        // Existing customer
        userId = existingCustomers[0].id;
      } else {
        // ---------------------------------------------
        // Create new customer account
        // ---------------------------------------------

        const name = shipping.name?.trim() || "Guest Customer";
        const email = shipping.email?.trim() || null;


        const [customer] =
          await connection.query<ResultSetHeader>(
            `
            INSERT INTO customers
            (
              name,
              email,
              phone,
              password
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              name,
              email,
              phone,
              "",
            ]
          );

        userId = customer.insertId;
      }
    }

    // --------------------------------------------------
    // Calculate subtotal using DB prices
    // --------------------------------------------------

    let subtotal = 0;

    for (const item of cart) {
      const qty = Number(item.qty);

      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error("Invalid product quantity.");
      }

      const [rows] = await connection.query<Product[]>(
        `
    SELECT id, price, offer_price
    FROM products
    WHERE id = ?
    LIMIT 1
    `,
        [item.id]
      );

      if (!rows.length) {
        throw new Error(`Product ${item.id} not found.`);
      }

      const price = Number(rows[0].price);
      const offerPrice = Number(rows[0].offer_price);

      // Use offer price if it exists and is lower than the normal price
      const finalPrice =
        offerPrice > 0 && offerPrice < price
          ? offerPrice
          : price;

      subtotal += finalPrice * qty;
    }


    // --------------------------------------------------
    // Coupon
    // --------------------------------------------------

    const discount = 0;

    // TODO:
    // Calculate coupon discount here using couponId

    // --------------------------------------------------
    // Total
    // --------------------------------------------------

   const total = Number(subtotal) + Number(shippingRate) - (Number(subtotal) * Number(couponDiscount)) / 100;

    // --------------------------------------------------
    // Order number
    // --------------------------------------------------

    const orderNo = `ORD-${Date.now().toString().slice(-6)}`;

    const shippingAddress = JSON.stringify(shipping);

    // --------------------------------------------------
    // Create Order
    // --------------------------------------------------

    const [order] =
      await connection.query<ResultSetHeader>(
        `
        INSERT INTO orders
        (
          order_no,
          user_id,
          coupon_discount,
          subtotal,
          shipping_rate,
          shipping_location,
          discount,
          total,
          payment_status,
          order_status,
          shipping_address,
          ordered_at
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          orderNo,
          userId,
          couponDiscount,
          subtotal,
          shippingRate,
          shippingLocation,
          discount,
          total,
          "PENDING",
          "PENDING",
          shippingAddress,
        ]
      );

    const orderId = order.insertId;

    // --------------------------------------------------
    // Create Order Items
    // --------------------------------------------------

    for (const item of cart) {
      const [rows] = await connection.query<Product[]>(
        `
    SELECT id, price, offer_price
    FROM products
    WHERE id = ?
    LIMIT 1
    `,
        [item.id]
      );

      if (!rows.length) {
        throw new Error(`Product ${item.id} not found.`);
      }

      const price = Number(rows[0].price);
      const offerPrice = Number(rows[0].offer_price);
      const qty = Number(item.qty);

      // Use offer price if available and valid
      const finalPrice =
        offerPrice > 0 && offerPrice < price
          ? offerPrice
          : price;

      const itemSubtotal = finalPrice * qty;

      await connection.query(
        `
    INSERT INTO order_items
    (
      order_id,
      product_id,
      qty,
      price,
      subtotal
    )
    VALUES (?, ?, ?, ?, ?)
    `,
        [
          orderId,
          item.id,
          qty,
          finalPrice,
          itemSubtotal,
        ]
      );
    }

    // --------------------------------------------------
    // Commit
    // --------------------------------------------------

    await connection.commit();

    // Total quantity of all products
    const totalItems = cart.reduce(
      (total: number, item: { qty: number }) =>
        total + Number(item.qty),
      0
    );


    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      orderId,
      orderNo,
      order: {
        orderId,
        order_no: orderNo,
        items_total: totalItems,
        total: Number(total),
        ordered_at: new Date().toISOString(),
      },
      userId,
      isGuest: !token,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Place order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function GET(req: NextRequest) {
  const connection = await db.getConnection();

  try {
    const token = req.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: userId } = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(searchParams.get("limit")) || 12, 1);
    const offset = (page - 1) * limit;

    // Search & filter
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "All";

    const conditions: string[] = ["o.user_id = ?"];
    const params: (string | number)[] = [userId];

    // Search by order number
    if (search) {
      conditions.push("o.order_no LIKE ?");
      params.push(`%${search}%`);
    }

    // Filter by order status
    if (status && status !== "All") {
      conditions.push("o.order_status = ?");
      params.push(status);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Get total orders
    const [countRows] = await connection.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total
      FROM orders o
      ${whereClause}
      `,
      params
    );

    const total = Number(countRows[0]?.total || 0);
    const totalPages = Math.ceil(total / limit);

    // Get orders
    const [orders] = await connection.query<Order[]>(
      `
      SELECT
        o.id,
        o.order_no,
        o.subtotal,
        o.shipping_rate,
        o.shipping_location,
        o.shipping_address,
        o.discount,
        o.total,
        o.payment_status,
        o.order_status,
        o.ordered_at,
        COALESCE(SUM(oi.qty), 0) AS items_total
      FROM orders o
      LEFT JOIN order_items oi
        ON oi.order_id = o.id
      ${whereClause}
      GROUP BY
        o.id,
        o.order_no,
        o.subtotal,
        o.shipping_rate,
        o.shipping_location,
        o.shipping_address,
        o.discount,
        o.total,
        o.payment_status,
        o.order_status,
        o.ordered_at
      ORDER BY o.ordered_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders.",
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}