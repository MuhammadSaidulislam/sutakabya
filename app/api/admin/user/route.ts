import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search")?.trim() || "";
    const offset = (page - 1) * limit;

    const whereClause = search
      ? `WHERE u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?`
      : "";

    const whereParams = search
      ? [`%${search}%`, `%${search}%`, `%${search}%`]
      : [];

    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT
          u.id,
          u.name,
          u.email,
          u.phone,
          u.status,
          u.created_at,

          COUNT(o.id) AS total_orders,

          COALESCE(SUM(o.total), 0) AS total_spent,

          MAX(o.ordered_at) AS last_order,

          lo.payment_status,
          lo.order_status

      FROM customers u

      LEFT JOIN orders o
          ON u.id = o.user_id

      LEFT JOIN (
          SELECT o1.*
          FROM orders o1
          INNER JOIN (
              SELECT user_id, MAX(id) AS last_order_id
              FROM orders
              GROUP BY user_id
          ) t
          ON o1.id = t.last_order_id
      ) lo
      ON lo.user_id = u.id

      ${whereClause}

      GROUP BY
          u.id,
          u.name,
          u.email,
          u.phone,
          u.status,
          u.created_at,
          lo.payment_status,
          lo.order_status

      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...whereParams, limit, offset]
    );

    const [countResult] = await db.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total
      FROM customers u
      ${whereClause}
      `,
      whereParams
    );

    const total = Number(countResult[0].total);

    return NextResponse.json({
      success: true,
      data: rows,
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
        message: "Failed to fetch customers.",
      },
      { status: 500 }
    );
  }
}