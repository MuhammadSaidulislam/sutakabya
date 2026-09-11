import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import  db  from "@/lib/db";
import { PoolClient } from "pg";

interface OrderRow extends RowDataPacket {
  id: number;
  order_no: string;
  user_id: number;

  subtotal: string | number;
  shipping: string | number;
  discount: string | number;
  coupon_discount: string | number;
  total: string | number;

  payment_status: string;
  order_status: string;

  ordered_at: string | null;
  created_at: string;

  customer_name: string;
  email: string | null;
  phone: string | null;
  shipping_address: string;
}

interface OrderItemRow extends RowDataPacket {
  order_item_id: number;
  order_id: number;
  product_id: number;

  qty: number;
  price: string | number;
  subtotal: string | number;

  product_name: string;
  sku: string | null;
  product_price: string | number;
//   sale_price: string | number | null;
  product_image: string | null;
}
interface ExistingOrderItem extends RowDataPacket {
    id: number;
    order_id: number;
    product_id: number;
    qty: number;
    price: string | number;
    subtotal: string | number;
    status: string;
}
interface UpdateOrderItem {
    order_item_id: number;
    qty: number;
    status: "ACTIVE" | "CANCELLED";
}
interface ShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
}
interface UpdateOrderRequest {
    items: UpdateOrderItem[];
    shipping_address: ShippingAddress;
    discount: number;
    shipping_rate: number;
    shipping_location: string;
    payment_status: string;
    order_status?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const orderId = Number(id);

    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // GET ORDER + CUSTOMER
    // ============================================================

    const orderResult = await db.query<OrderRow>(
      `
      SELECT
        o.id,
        o.order_no,
        o.user_id,

        o.subtotal,
        o.shipping_rate,
        o.shipping_location,
        o.discount,
        o.coupon_discount,
        o.total,

        o.payment_status,
        o.order_status,

        o.ordered_at,
        o.created_at,
        o.shipping_address,

        u.id AS customer_id,
        u.name AS customer_name,
        u.email,
        u.phone

      FROM orders o

      INNER JOIN customers u
        ON u.id = o.user_id

      WHERE o.id = $1

      LIMIT 1
      `,
      [orderId]
    );

    const orderRows = orderResult.rows;

    if (orderRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    const order = orderRows[0];

    // ============================================================
    // GET ORDER ITEMS + PRODUCTS
    // ============================================================

    const itemResult = await db.query<OrderItemRow>(
      `
      SELECT
        oi.id AS order_item_id,
        oi.order_id,
        oi.product_id,

        oi.qty,
        oi.price,
        oi.status,
        oi.subtotal,

        p.name AS product_name,
        p.sku,
        p.price AS product_price,

        pi.image_url AS product_image

      FROM order_items oi

      INNER JOIN products p
        ON p.id = oi.product_id

      LEFT JOIN LATERAL (
        SELECT image_url
        FROM product_images
        WHERE product_id = p.id
        ORDER BY is_thumbnail DESC, id ASC
        LIMIT 1
      ) pi ON true

      WHERE oi.order_id = $1

      ORDER BY oi.id ASC
      `,
      [orderId]
    );

    const itemRows = itemResult.rows;

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,

      data: {
        order: {
          id: order.id,
          order_no: order.order_no,
          user_id: order.user_id,
          subtotal: Number(order.subtotal),
          shipping_rate: Number(order.shipping_rate),
          shipping_location: order.shipping_location,
          coupon_discount: order.coupon_discount,
          discount: Number(order.discount),
          total: Number(order.total),

          payment_status: order.payment_status,
          order_status: order.order_status,
          shipping_address: order.shipping_address,

          ordered_at: order.ordered_at,
          created_at: order.created_at,
        },

        customer: {
          id: order.customer_id,
          name: order.customer_name,
          email: order.email,
          phone: order.phone,
        },

        products: itemRows.map((item) => ({
          order_item_id: item.order_item_id,
          order_id: item.order_id,
          product_id: item.product_id,

          qty: Number(item.qty),
          price: Number(item.price),
          subtotal: Number(item.subtotal),

          product: {
            name: item.product_name,
            sku: item.sku,
            status: item.status,
            price: Number(item.product_price),
            image: item.product_image,
          },
        })),
      },
    });
  } catch (error) {
    console.error("Get Single Order Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order.",
      },
      { status: 500 }
    );
  }
}

// update order

// ============================================================
// PUT - UPDATE ORDER
// ============================================================



export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: PoolClient | null = null;

  try {
    // ========================================================
    // ORDER ID
    // ========================================================

    const { id } = await params;

    const orderId = Number(id);

    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // REQUEST BODY
    // ========================================================

    const body = (await req.json()) as UpdateOrderRequest;

    const {
      items,
      shipping_address,
      discount,
      shipping_rate,
      shipping_location,
      payment_status,
      order_status,
    } = body;

    // ========================================================
    // VALIDATE ITEMS
    // ========================================================

    if (!Array.isArray(items)) {
      return NextResponse.json(
        {
          success: false,
          message: "Items must be an array.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // VALIDATE ADDRESS
    // ========================================================

    if (
      !shipping_address ||
      typeof shipping_address !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping address is required.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // VALIDATE MONEY
    // ========================================================

    const discountAmount = Number(discount ?? 0);
    const shippingAmount = Number(shipping_rate ?? 0);

    if (
      !Number.isFinite(discountAmount) ||
      discountAmount < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid discount amount.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(shippingAmount) ||
      shippingAmount < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid shipping amount.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // GET ORDER
    // ========================================================

    const orderResult = await db.query<{
      id: number;
      order_status: string;
    }>(
      `
      SELECT
        id,
        order_status
      FROM orders
      WHERE id = $1
      LIMIT 1
      `,
      [orderId]
    );

    const orderRows = orderResult.rows;

    if (orderRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    // ========================================================
    // GET EXISTING ORDER ITEMS
    // ========================================================

    const existingItemsResult =
      await db.query<ExistingOrderItem>(
        `
        SELECT
          id,
          order_id,
          product_id,
          qty,
          price,
          subtotal,
          status
        FROM order_items
        WHERE order_id = $1
        ORDER BY id ASC
        `,
        [orderId]
      );

    const existingItems = existingItemsResult.rows;

    // ========================================================
    // VALIDATE ALL ORDER ITEMS
    // ========================================================

    const existingItemMap =
      new Map<number, ExistingOrderItem>();

    for (const item of existingItems) {
      existingItemMap.set(Number(item.id), item);
    }

    for (const item of items) {
      const itemId = Number(item.order_item_id);

      // --------------------------------------------
      // Check item belongs to this order
      // --------------------------------------------

      if (!existingItemMap.has(itemId)) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Order item ${itemId} does not belong to this order.`,
          },
          { status: 400 }
        );
      }

      // --------------------------------------------
      // Validate status
      // --------------------------------------------

      if (
        item.status !== "ACTIVE" &&
        item.status !== "CANCELLED"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Invalid status for order item ${itemId}.`,
          },
          { status: 400 }
        );
      }

      // --------------------------------------------
      // Validate quantity
      // --------------------------------------------

      const qty = Number(item.qty);

      if (
        !Number.isInteger(qty) ||
        qty < 1
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Invalid quantity for order item ${itemId}.`,
          },
          { status: 400 }
        );
      }
    }

    // ========================================================
    // START TRANSACTION
    // ========================================================

    client = await db.connect();

    try {
      await client.query("BEGIN");

      // ====================================================
      // UPDATE ORDER ITEMS
      // ====================================================

      for (const item of items) {
        const existingItem =
          existingItemMap.get(
            Number(item.order_item_id)
          );

        if (!existingItem) {
          throw new Error(
            `Order item ${item.order_item_id} not found.`
          );
        }

        const qty = Number(item.qty);
        const price = Number(existingItem.price);

        const itemSubtotal =
          item.status === "CANCELLED"
            ? 0
            : price * qty;

        await client.query(
          `
          UPDATE order_items
          SET
            qty = $1,
            subtotal = $2,
            status = $3
          WHERE id = $4
            AND order_id = $5
          `,
          [
            qty,
            itemSubtotal,
            item.status,
            Number(item.order_item_id),
            orderId,
          ]
        );
      }

      // ====================================================
      // UPDATE SHIPPING ADDRESS + ORDER CHARGES
      // ====================================================

      const addressData = {
        name:
          shipping_address.name?.trim() || "",
        phone:
          shipping_address.phone?.trim() || "",
        address:
          shipping_address.address?.trim() || "",
        city:
          shipping_address.city?.trim() || "",
        zip:
          shipping_address.zip?.trim() || "",
      };

      await client.query(
        `
        UPDATE orders
        SET
          shipping_address = $1,
          shipping_rate = $2,
          discount = $3,
          payment_status = $4,
          order_status = $5
        WHERE id = $6
        `,
        [
          JSON.stringify(addressData),
          shippingAmount,
          discountAmount,
          payment_status || "PENDING",
          order_status || "PROCESSING",
          orderId,
        ]
      );

      // ====================================================
      // RECALCULATE SUBTOTAL
      // ====================================================

      const subtotalResult = await client.query<{
        subtotal: string | number;
      }>(
        `
        SELECT
          COALESCE(
            SUM(subtotal),
            0
          ) AS subtotal
        FROM order_items
        WHERE order_id = $1
          AND status = 'ACTIVE'
        `,
        [orderId]
      );

      const calculatedSubtotal = Number(
        subtotalResult.rows[0]?.subtotal || 0
      );

      // ====================================================
      // CALCULATE TOTAL
      // ====================================================

      const calculatedTotal = Math.max(
        0,
        calculatedSubtotal +
          shippingAmount -
          discountAmount
      );

      // ====================================================
      // UPDATE ORDER TOTALS
      // ====================================================

      await client.query(
        `
        UPDATE orders
        SET
          subtotal = $1,
          total = $2
        WHERE id = $3
        `,
        [
          calculatedSubtotal,
          calculatedTotal,
          orderId,
        ]
      );

      // ====================================================
      // COMMIT
      // ====================================================

      await client.query("COMMIT");

      // ====================================================
      // RESPONSE
      // ====================================================

      return NextResponse.json({
        success: true,

        message: "Order updated successfully.",

        data: {
          order_id: orderId,

          subtotal: calculatedSubtotal,

          shipping_rate: shippingAmount,

          discount: discountAmount,

          total: calculatedTotal,

          payment_status:
            payment_status || "PENDING",

          order_status:
            order_status || "PROCESSING",

          shipping_address: addressData,
        },
      });
    } catch (error) {
      // ====================================================
      // ROLLBACK
      // ====================================================

      await client.query("ROLLBACK");

      throw error;
    }
  } catch (error) {
    console.error(
      "Update Order Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update order.",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}