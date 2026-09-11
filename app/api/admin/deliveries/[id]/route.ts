import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import  db  from "@/lib/db";
import { PoolClient } from "pg";

const VALID_STATUSES = [
  "PENDING",
  "PROCESSING",
  "PREPARING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURN",
  "FAILED",
] as const;


interface Delivery extends RowDataPacket {
  id: number;
  order_id: number;
  courier_company: string | null;
  delivery_date: string | null;
  status:
    | "PREPARING"
    | "SHIPPED"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "FAILED";
  created_at: string;
  updated_at: string;
}

interface Order extends RowDataPacket {
  id: number;
  order_no: string;
  order_status: string;
}

// ============================================================
// GET SINGLE DELIVERY
// GET /api/admin/deliveries/[id]
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await db.query(
      `SELECT
        d.id,
        d.order_id,
        d.courier_company,
        d.delivery_date,
        d.status AS delivery_status,
        o.order_no,
        o.order_status,
        o.payment_status,
        c.id AS customer_id,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email,
        o.shipping_address,
        o.shipping_location,
        o.subtotal,
        o.shipping_rate,
        o.discount,
        o.coupon_discount,
        o.total,
        o.ordered_at,
        d.created_at,
        d.updated_at
      FROM deliveries d
      INNER JOIN orders o ON o.id = d.order_id
      LEFT JOIN customers c ON c.id = o.user_id
      WHERE d.order_id = $1
      LIMIT 1`,
      [id]
    );

    const rows = result.rows;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery not found",
        },
        { status: 201 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get delivery error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch delivery",
      },
      { status: 500 }
    );
  }
}


// ============================================================
// UPDATE DELIVERY
// PUT /api/admin/deliveries/[id]
// ============================================================



export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: PoolClient | null = null;

  try {
    const { id } = await params;

    const body = await request.json();

    const {
      courier_company,
      delivery_date,
      status,
    } = body;

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery ID is required",
        },
        { status: 400 }
      );
    }

    if (
      status !== undefined &&
      !VALID_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid delivery status",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // GET CONNECTION
    // ============================================================

    client = await db.connect();

    await client.query("BEGIN");

    // ============================================================
    // CHECK DELIVERY
    // ============================================================

    const existingResult = await client.query(
      `
      SELECT
        id,
        order_id,
        courier_company,
        delivery_date,
        status
      FROM deliveries
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    const existing = existingResult.rows;

    if (existing.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Delivery not found",
        },
        { status: 404 }
      );
    }

    const existingDelivery = existing[0];

    // ============================================================
    // CHECK RELATED ORDER
    // ============================================================

    const ordersResult = await client.query(
      `
      SELECT
        id,
        order_no,
        order_status
      FROM orders
      WHERE id = $1
      LIMIT 1
      `,
      [existingDelivery.order_id]
    );

    const orders = ordersResult.rows;

    if (orders.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    const currentOrderStatus = orders[0].order_status;

    // ============================================================
    // PREVENT CHANGING CANCELLED / RETURNED ORDER
    // ============================================================

    if (
      ["CANCELLED", "RETURN"].includes(currentOrderStatus) &&
      status !== undefined &&
      status !== currentOrderStatus
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: `Cannot change delivery status because order is ${currentOrderStatus}`,
        },
        { status: 400 }
      );
    }

    // ============================================================
    // BUILD UPDATE QUERY
    // ============================================================

    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (courier_company !== undefined) {
      values.push(courier_company?.trim() || null);
      fields.push(`courier_company = $${values.length}`);
    }

    if (delivery_date !== undefined) {
      values.push(delivery_date || null);
      fields.push(`delivery_date = $${values.length}`);
    }

    if (status !== undefined) {
      values.push(status);
      fields.push(`status = $${values.length}`);
    }

    // ============================================================
    // NO FIELDS
    // ============================================================

    if (fields.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "No fields provided for update",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // UPDATE DELIVERY
    // ============================================================

    values.push(id);

    await client.query(
      `
      UPDATE deliveries
      SET ${fields.join(", ")}
      WHERE id = $${values.length}
      `,
      values
    );

    // ============================================================
    // UPDATE ORDER STATUS
    //
    // Only update order status when delivery status changes.
    // Both statuses remain exactly the same.
    // ============================================================

    if (status !== undefined) {
      await client.query(
        `
        UPDATE orders
        SET order_status = $1
        WHERE id = $2
        `,
        [
          status,
          existingDelivery.order_id,
        ]
      );
    }

    // ============================================================
    // GET UPDATED DELIVERY
    // ============================================================

    const updatedResult = await client.query(
      `
      SELECT
        id,
        order_id,
        courier_company,
        delivery_date,
        status,
        created_at,
        updated_at
      FROM deliveries
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    const rows = updatedResult.rows;

    // ============================================================
    // COMMIT
    // ============================================================

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: "Delivery updated successfully",
      data: rows[0],
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

    console.error("Update delivery error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update delivery",
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}