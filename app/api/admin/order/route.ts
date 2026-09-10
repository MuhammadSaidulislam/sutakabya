import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";
    const paymentStatus = searchParams.get("payment_status")?.trim() || "";
    const orderStatus = searchParams.get("order_status")?.trim() || "";

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    // Search
    if (search) {
      conditions.push(`
        (
          o.order_no LIKE ?
          OR u.name LIKE ?
          OR u.email LIKE ?
          OR u.phone LIKE ?
        )
      `);

      params.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    // Payment Status Filter
    if (paymentStatus && paymentStatus !== "All") {
      conditions.push("o.payment_status = ?");
      params.push(paymentStatus);
    }

    // Order Status Filter
    if (orderStatus && orderStatus !== "All") {
      conditions.push("o.order_status = ?");
      params.push(orderStatus);
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const [orders] = await db.query<RowDataPacket[]>(
      `
      SELECT
        o.id,
        o.order_no,
        o.user_id,

        u.name AS customer_name,
        u.email,
        u.phone,

        o.subtotal,
        o.shipping_rate,
        o.shipping_location,
        o.discount,
        o.total,

        o.payment_status,
        o.order_status,

        o.ordered_at,
        o.created_at,

        COUNT(oi.id) AS total_products,
        COALESCE(SUM(oi.qty), 0) AS total_qty,
        COALESCE(SUM(oi.subtotal), 0) AS items_total

      FROM orders o

      INNER JOIN customers u
        ON o.user_id = u.id

      LEFT JOIN order_items oi
        ON oi.order_id = o.id

      ${whereClause}

      GROUP BY
        o.id,
        o.order_no,
        o.user_id,
        u.name,
        u.email,
        u.phone,
        o.subtotal,
        o.shipping_rate,
        o.shipping_location,
        o.discount,
        o.total,
        o.payment_status,
        o.order_status,
        o.ordered_at,
        o.created_at

      ORDER BY o.created_at DESC

      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [countResult] = await db.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total
      FROM orders o
      INNER JOIN customers u
        ON o.user_id = u.id

      ${whereClause}
      `,
      params
    );

    const total = Number(countResult[0].total);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders.",
      },
      { status: 500 }
    );
  }
}