import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
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
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT
        d.id, d.order_id, d.courier_company, d.delivery_date, d.status AS delivery_status,
        o.order_no, o.order_status, o.payment_status,
        c.id AS customer_id, c.name AS customer_name, c.phone AS customer_phone, c.email AS customer_email,
        o.shipping_address, o.shipping_location,
        o.subtotal, o.shipping_rate, o.discount, o.coupon_discount, o.total,
        o.ordered_at, d.created_at, d.updated_at
      FROM deliveries d
      INNER JOIN orders o ON o.id = d.order_id
      LEFT JOIN customers c ON c.id = o.user_id
      WHERE d.order_id = ?
      LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Delivery not found" },
        { status: 201 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Get delivery error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch delivery" },
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
  let connection;

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

    connection = await db.getConnection();

    await connection.beginTransaction();

    // ============================================================
    // CHECK DELIVERY
    // ============================================================

    const [existing] =
      await connection.query<RowDataPacket[]>(
        `
        SELECT
          id,
          order_id,
          courier_company,
          delivery_date,
          status
        FROM deliveries
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (existing.length === 0) {
      await connection.rollback();

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

    const [orders] =
      await connection.query<RowDataPacket[]>(
        `
        SELECT
          id,
          order_no,
          order_status
        FROM orders
        WHERE id = ?
        LIMIT 1
        `,
        [existingDelivery.order_id]
      );

    if (orders.length === 0) {
      await connection.rollback();

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
      ["CANCELLED", "RETURN"].includes(
        currentOrderStatus
      ) &&
      status !== undefined &&
      status !== currentOrderStatus
    ) {
      await connection.rollback();

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
    const values: (string | null)[] = [];

    if (courier_company !== undefined) {
      fields.push("courier_company = ?");
      values.push(
        courier_company?.trim() || null
      );
    }

    if (delivery_date !== undefined) {
      fields.push("delivery_date = ?");
      values.push(delivery_date || null);
    }

    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }

    // ============================================================
    // NO FIELDS
    // ============================================================

    if (fields.length === 0) {
      await connection.rollback();

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

    await connection.query(
      `
      UPDATE deliveries
      SET ${fields.join(", ")}
      WHERE id = ?
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
      await connection.query(
        `
        UPDATE orders
        SET order_status = ?
        WHERE id = ?
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

    const [rows] =
      await connection.query<RowDataPacket[]>(
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
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    // ============================================================
    // COMMIT
    // ============================================================

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Delivery updated successfully",
      data: rows[0],
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
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
    if (connection) {
      connection.release();
    }
  }
}