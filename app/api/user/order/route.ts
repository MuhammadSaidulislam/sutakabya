import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2/promise";
import jwt from "jsonwebtoken";
import db  from "@/lib/db";
import { PoolClient } from "pg";

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


export async function POST(req: NextRequest) {
    let client: PoolClient | null = null;

    try {
        // ==============================
        // Get token
        // ==============================

        const token = req.cookies.get("user_token")?.value;

        const {
            shipping,
            shippingRate,
            shippingLocation,
            couponDiscount,
            cart,
        } = await req.json();

        // ==============================
        // Validate cart
        // ==============================

        if (!cart?.length) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cart is empty.",
                },
                { status: 400 }
            );
        }

        // ==============================
        // Validate phone
        // ==============================

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

        // ==============================
        // Start PostgreSQL transaction
        // ==============================

        client = await db.connect();

        await client.query("BEGIN");

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
                    await client.query("ROLLBACK");

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
                await client.query("ROLLBACK");

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

            const existingCustomerResult = await client.query<{
                id: number;
                name: string;
                email: string | null;
                phone: string | null;
            }>(
                `
                SELECT id, name, email, phone
                FROM customers
                WHERE phone = $1
                LIMIT 1
                `,
                [phone]
            );

            const existingCustomers = existingCustomerResult.rows;

            if (existingCustomers.length) {
                // Existing customer
                userId = Number(existingCustomers[0].id);
            } else {
                // ---------------------------------------------
                // Create new customer account
                // ---------------------------------------------

                const name =
                    shipping.name?.trim() || "Guest Customer";

                const email =
                    shipping.email?.trim() || null;

                const customerResult = await client.query<{
                    id: number;
                }>(
                    `
                    INSERT INTO customers
                    (
                        name,
                        email,
                        phone,
                        password
                    )
                    VALUES ($1, $2, $3, $4)
                    RETURNING id
                    `,
                    [
                        name,
                        email,
                        phone,
                        "",
                    ]
                );

                userId = Number(customerResult.rows[0].id);
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

            const productResult = await client.query<{
                id: number;
                price: number | string;
                offer_price: number | string | null;
            }>(
                `
                SELECT id, price, offer_price
                FROM products
                WHERE id = $1
                LIMIT 1
                `,
                [item.id]
            );

            const rows = productResult.rows;

            if (!rows.length) {
                throw new Error(`Product ${item.id} not found.`);
            }

            const price = Number(rows[0].price);
            const offerPrice = Number(rows[0].offer_price);

            // Use offer price if it exists and is lower than normal price
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

        const total =
            Number(subtotal) +
            Number(shippingRate) -
            (Number(subtotal) * Number(couponDiscount)) / 100;

        // --------------------------------------------------
        // Order number
        // --------------------------------------------------

        const orderNo = `ORD-${Date.now().toString().slice(-6)}`;

        const shippingAddress = JSON.stringify(shipping);

        // --------------------------------------------------
        // Create Order
        // --------------------------------------------------

        const orderResult = await client.query<{
            id: number;
        }>(
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
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                NOW()
            )
            RETURNING id
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

        const orderId = Number(orderResult.rows[0].id);

        // --------------------------------------------------
        // Create Order Items
        // --------------------------------------------------

        for (const item of cart) {
            const productResult = await client.query<{
                id: number;
                price: number | string;
                offer_price: number | string | null;
            }>(
                `
                SELECT id, price, offer_price
                FROM products
                WHERE id = $1
                LIMIT 1
                `,
                [item.id]
            );

            const rows = productResult.rows;

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

            await client.query(
                `
                INSERT INTO order_items
                (
                    order_id,
                    product_id,
                    qty,
                    price,
                    subtotal
                )
                VALUES ($1, $2, $3, $4, $5)
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

        await client.query("COMMIT");

        // --------------------------------------------------
        // Total quantity of all products
        // --------------------------------------------------

        const totalItems = cart.reduce(
            (total: number, item: { qty: number }) =>
                total + Number(item.qty),
            0
        );

        // --------------------------------------------------
        // Response
        // --------------------------------------------------

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
        if (client) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }
        }

        console.error("Place order error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to place order.",
            },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release();
        }
    }
}

export async function GET(req: NextRequest) {
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

    // ==============================
    // Pagination
    // ==============================

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.max(
      Number(searchParams.get("limit")) || 12,
      1
    );

    const offset = (page - 1) * limit;

    // ==============================
    // Search & filter
    // ==============================

    const search =
      searchParams.get("search")?.trim() || "";

    const status =
      searchParams.get("status")?.trim() || "All";

    const conditions: string[] = ["o.user_id = $1"];
    const params: (string | number)[] = [userId];

    // Search by order number
    if (search) {
      const paramIndex = params.length + 1;

      conditions.push(
        `o.order_no ILIKE $${paramIndex}`
      );

      params.push(`%${search}%`);
    }

    // Filter by order status
    if (status && status !== "All") {
      const paramIndex = params.length + 1;

      conditions.push(
        `o.order_status = $${paramIndex}`
      );

      params.push(status);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // ==============================
    // Get total orders
    // ==============================

    const countResult = await db.query<{ total: string }>(
      `
      SELECT COUNT(*) AS total
      FROM orders o
      ${whereClause}
      `,
      params
    );

    const total = Number(
      countResult.rows[0]?.total || 0
    );

    const totalPages = Math.ceil(total / limit);

    // ==============================
    // Pagination parameters
    // ==============================

    const limitParam = `$${params.length + 1}`;
    const offsetParam = `$${params.length + 2}`;

    const orderParams = [
      ...params,
      limit,
      offset,
    ];

    // ==============================
    // Get orders
    // ==============================

    const ordersResult = await db.query<Order>(
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
      LIMIT ${limitParam}
      OFFSET ${offsetParam}
      `,
      orderParams
    );

    const orders = ordersResult.rows;

    // ==============================
    // Response
    // ==============================

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
  }
}