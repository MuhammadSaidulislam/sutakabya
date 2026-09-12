import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import  db  from "@/lib/db";

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

// ============================================================
// GET ALL DELIVERIES
// GET /api/admin/deliveries
// ============================================================


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ============================================================
    // PAGINATION
    // ============================================================

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit")) || 10,
        1
      ),
      100
    );

    const offset = (page - 1) * limit;

    // ============================================================
    // FILTERS
    // ============================================================

    const search =
      searchParams.get("search")?.trim() || "";

    const paymentStatus =
      searchParams.get("payment_status")?.trim() || "";

    const orderStatus =
      searchParams.get("order_status")?.trim() || "";

    const deliveryStatus =
      searchParams.get("delivery_status")?.trim() || "";

    // ============================================================
    // WHERE CONDITIONS
    // ============================================================

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    // Search
    if (search) {
      const searchValue = `%${search}%`;

      values.push(searchValue);
      const orderNoParam = `$${values.length}`;

      values.push(searchValue);
      const courierParam = `$${values.length}`;

      values.push(searchValue);
      const orderIdParam = `$${values.length}`;

      values.push(searchValue);
      const customerNameParam = `$${values.length}`;

      values.push(searchValue);
      const phoneParam = `$${values.length}`;

      conditions.push(`
        (
          o.order_no ILIKE ${orderNoParam}
          OR d.courier_company ILIKE ${courierParam}
          OR CAST(d.order_id AS TEXT) ILIKE ${orderIdParam}
          OR c.name ILIKE ${customerNameParam}
          OR c.phone ILIKE ${phoneParam}
        )
      `);
    }

    // Payment status
    if (paymentStatus) {
      values.push(paymentStatus);

      conditions.push(
        `o.payment_status = $${values.length}`
      );
    }

    // Order status
    if (orderStatus) {
      values.push(orderStatus);

      conditions.push(
        `o.order_status = $${values.length}`
      );
    }

    // Delivery status
    if (deliveryStatus) {
      values.push(deliveryStatus);

      conditions.push(
        `d.status = $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // ============================================================
    // GET TOTAL
    // ============================================================

    const countResult = await db.query(
      `
      SELECT COUNT(*) AS total

      FROM deliveries d

      INNER JOIN orders o
        ON o.id = d.order_id

      LEFT JOIN customers c
        ON c.id = o.user_id

      ${whereClause}
      `,
      values
    );

    const total = Number(
      countResult.rows[0]?.total || 0
    );

    const totalPages =
      total > 0
        ? Math.ceil(total / limit)
        : 0;

    // ============================================================
    // GET DELIVERIES
    // ============================================================

    const dataValues = [
      ...values,
      limit,
      offset,
    ];

    const limitParam = `$${values.length + 1}`;
    const offsetParam = `$${values.length + 2}`;

    const deliveriesResult = await db.query(
      `
      SELECT
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

        o.shipping_address,

        o.subtotal,
        o.shipping_rate,
        o.total,

        o.ordered_at,
        d.created_at,
        d.updated_at

      FROM deliveries d

      INNER JOIN orders o
        ON o.id = d.order_id

      LEFT JOIN customers c
        ON c.id = o.user_id

      ${whereClause}

      ORDER BY d.id DESC

      LIMIT ${limitParam}
      OFFSET ${offsetParam}
      `,
      dataValues
    );

    const rows = deliveriesResult.rows;

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
        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "Get deliveries error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch deliveries",
      },
      { status: 500 }
    );
  }
}



// ============================================================
// CREATE DELIVERY
// POST /api/admin/deliveries
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id: orderNo, // this is the human-readable order number, e.g. "ORD-283441"
      courier_company,
      delivery_date,
      status,
    } = body;

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!orderNo) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    const validStatuses = [
      "PREPARING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "FAILED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid delivery status",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // CHECK ORDER
    // ============================================================

    const ordersResult = await db.query(
      `
      SELECT id, order_no, order_status
      FROM orders
      WHERE order_no = $1
      LIMIT 1
      `,
      [orderNo]
    );
    const orders = ordersResult.rows;

    if (orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    const currentOrderStatus = orders[0].order_status;
    const orderPk = orders[0].id; // numeric orders.id, used as FK in deliveries

    // Don't create delivery for cancelled order
    if (currentOrderStatus === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot create delivery for a cancelled order",
        },
        { status: 400 }
      );
    }

    // Don't create delivery for returned order
    if (currentOrderStatus === "RETURN") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot create delivery for a returned order",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // CHECK EXISTING DELIVERY
    // ============================================================

    const existingResult = await db.query(
      `
      SELECT id
      FROM deliveries
      WHERE order_id = $1
      LIMIT 1
      `,
      [orderPk]
    );

    const existing = existingResult.rows;

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery already exists for this order",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // CREATE DELIVERY
    // ============================================================

    const result = await db.query<{ id: number }>(
      `
      INSERT INTO deliveries
        (
          order_id,
          courier_company,
          delivery_date,
          status
        )
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [
        orderPk,
        courier_company || null,
        delivery_date || null,
        status,
      ]
    );

    const deliveryId = result.rows[0].id;

    // ============================================================
    // UPDATE ORDER STATUS
    // ============================================================

    let newOrderStatus: string | null = null;

    switch (status) {
      case "PREPARING":
        newOrderStatus = "PROCESSING";
        break;

      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        newOrderStatus = "SHIPPED";
        break;

      case "DELIVERED":
        newOrderStatus = "DELIVERED";
        break;

      case "FAILED":
        // Keep current order status
        newOrderStatus = null;
        break;
    }

    if (newOrderStatus) {
      await db.query(
        `
        UPDATE orders
        SET order_status = $1
        WHERE id = $2
        `,
        [newOrderStatus, orderPk]
      );
    }

    // ============================================================
    // GET CREATED DELIVERY
    // ============================================================

    const deliveryResult = await db.query<Delivery>(
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
      `,
      [deliveryId]
    );

    const rows = deliveryResult.rows;

    return NextResponse.json(
      {
        success: true,
        message: "Delivery created successfully",
        data: rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create delivery error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create delivery",
      },
      { status: 500 }
    );
  }
}