import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import  db from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search =
      searchParams.get("search")?.trim() || "";

    const offset = (page - 1) * limit;

    // ============================================================
    // SEARCH
    // ============================================================

    const whereClause = search
      ? `
        WHERE
          u.name ILIKE $1
          OR u.email ILIKE $2
          OR u.phone ILIKE $3
      `
      : "";

    const whereParams: (string | number)[] = search
      ? [
          `%${search}%`,
          `%${search}%`,
          `%${search}%`,
        ]
      : [];

    // ============================================================
    // GET CUSTOMERS
    // ============================================================

    const limitParam =
      `$${whereParams.length + 1}`;

    const offsetParam =
      `$${whereParams.length + 2}`;

    const result = await db.query(
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
              SELECT
                  user_id,
                  MAX(id) AS last_order_id
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

      LIMIT ${limitParam}
      OFFSET ${offsetParam}
      `,
      [
        ...whereParams,
        limit,
        offset,
      ]
    );

    const rows = result.rows;

    // ============================================================
    // TOTAL COUNT
    // ============================================================

    const countResult = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM customers u
      ${whereClause}
      `,
      whereParams
    );

    const total = Number(
      countResult.rows[0]?.total || 0
    );

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(
          total / limit
        ),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch customers.",
      },
      { status: 500 }
    );
  }
}