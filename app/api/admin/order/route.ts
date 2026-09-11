import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import  db  from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";
    const paymentStatus =
      searchParams.get("payment_status")?.trim() || "";
    const orderStatus =
      searchParams.get("order_status")?.trim() || "";

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    // ========================================================
    // SEARCH
    // ========================================================

    if (search) {
      const searchValue = `%${search}%`;

      params.push(searchValue);
      const orderNoParam = `$${params.length}`;

      params.push(searchValue);
      const customerNameParam = `$${params.length}`;

      params.push(searchValue);
      const emailParam = `$${params.length}`;

      params.push(searchValue);
      const phoneParam = `$${params.length}`;

      conditions.push(`
        (
          o.order_no ILIKE ${orderNoParam}
          OR u.name ILIKE ${customerNameParam}
          OR u.email ILIKE ${emailParam}
          OR u.phone ILIKE ${phoneParam}
        )
      `);
    }

    // ========================================================
    // PAYMENT STATUS FILTER
    // ========================================================

    if (
      paymentStatus &&
      paymentStatus !== "All"
    ) {
      params.push(paymentStatus);

      conditions.push(
        `o.payment_status = $${params.length}`
      );
    }

    // ========================================================
    // ORDER STATUS FILTER
    // ========================================================

    if (
      orderStatus &&
      orderStatus !== "All"
    ) {
      params.push(orderStatus);

      conditions.push(
        `o.order_status = $${params.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // ========================================================
    // GET ORDERS
    // ========================================================

    const orderParams = [
      ...params,
      limit,
      offset,
    ];

    const limitParam = `$${params.length + 1}`;
    const offsetParam = `$${params.length + 2}`;

    const ordersResult = await db.query(
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

      LIMIT ${limitParam}
      OFFSET ${offsetParam}
      `,
      orderParams
    );

    const orders = ordersResult.rows;

    // ========================================================
    // COUNT ORDERS
    // ========================================================

    const countResult = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM orders o

      INNER JOIN customers u
        ON o.user_id = u.id

      ${whereClause}
      `,
      params
    );

    const total = Number(
      countResult.rows[0]?.total ?? 0
    );

    // ========================================================
    // RESPONSE
    // ========================================================

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