
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    // ============================================================
    // 1. TOTAL CUSTOMERS
    // ============================================================

    const customersCountResult = await db.query(`
      SELECT COUNT(*) AS total_customers
      FROM customers
    `);

    // ============================================================
    // 2. TOTAL PRODUCTS
    // ============================================================

    const productsCountResult = await db.query(`
      SELECT COUNT(*) AS total_products
      FROM products
      WHERE status != 'INACTIVE'
    `);

    // ============================================================
    // 3. CURRENT MONTH ORDERS
    // ============================================================

    const monthlyOrdersResult = await db.query(`
      SELECT COUNT(*) AS monthly_orders
      FROM orders
      WHERE
        created_at >= DATE_TRUNC('month', CURRENT_DATE)
        AND created_at < DATE_TRUNC('month', CURRENT_DATE)
            + INTERVAL '1 month'
        AND order_status NOT IN ('FAILED', 'CANCELLED')
    `);

    // ============================================================
    // 4. CURRENT MONTH REVENUE
    // ============================================================

    const monthlyRevenueResult = await db.query(`
      SELECT
        COALESCE(SUM(o.total), 0) AS monthly_revenue
      FROM orders o
      WHERE
        o.created_at >= DATE_TRUNC('month', CURRENT_DATE)
        AND o.created_at < DATE_TRUNC('month', CURRENT_DATE)
            + INTERVAL '1 month'
        AND o.order_status NOT IN ('FAILED', 'CANCELLED')
    `);

    // ============================================================
    // 5. CUSTOMER LIST
    // ============================================================

    const customerListResult = await db.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,

        COUNT(
          CASE
            WHEN o.order_status NOT IN ('FAILED', 'CANCELLED')
            THEN o.id
          END
        ) AS total_orders,

        COALESCE(
          SUM(
            CASE
              WHEN o.order_status NOT IN ('FAILED', 'CANCELLED')
              THEN o.total
              ELSE 0
            END
          ),
          0
        ) AS total_spent

      FROM customers u

      LEFT JOIN orders o
        ON o.user_id = u.id

      GROUP BY
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at

      ORDER BY u.created_at DESC
    `);

    // ============================================================
    // 6. RECENT 5 ORDERS
    // ============================================================

    const recentOrdersResult = await db.query(`
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
        COALESCE(SUM(oi.qty), 0) AS total_qty

      FROM orders o

      INNER JOIN customers u
        ON o.user_id = u.id

      LEFT JOIN order_items oi
        ON oi.order_id = o.id

      WHERE o.order_status NOT IN ('FAILED', 'CANCELLED')

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

      LIMIT 5
    `);

    // ============================================================
    // 7. MONTHLY REVENUE - JANUARY TO DECEMBER
    // CURRENT YEAR
    // ============================================================

    const monthlyRevenueListResult = await db.query(`
      SELECT
        EXTRACT(MONTH FROM o.created_at)::INTEGER AS month_number,

        COALESCE(SUM(o.total), 0) AS sales,

        COUNT(o.id) AS orders

      FROM orders o

      WHERE
        EXTRACT(YEAR FROM o.created_at) =
          EXTRACT(YEAR FROM CURRENT_DATE)

        AND o.order_status NOT IN ('FAILED', 'CANCELLED')

      GROUP BY
        EXTRACT(MONTH FROM o.created_at)

      ORDER BY
        month_number ASC
    `);

    // ============================================================
    // 8. CREATE JAN - DEC ARRAY
    // EVEN MONTHS WITH NO ORDERS WILL RETURN 0
    // ============================================================

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyDataMap = new Map<
      number,
      {
        sales: number;
        orders: number;
      }
    >();

    for (const row of monthlyRevenueListResult.rows ?? []) {
      monthlyDataMap.set(Number(row.month_number), {
        sales: Number(row.sales ?? 0),
        orders: Number(row.orders ?? 0),
      });
    }

    const monthlySales = monthNames.map((month, index) => {
      const monthNumber = index + 1;

      const data = monthlyDataMap.get(monthNumber);

      return {
        month,
        sales: data?.sales ?? 0,
        orders: data?.orders ?? 0,
      };
    });

    // ============================================================
    // 9. FORMAT RECENT ORDERS
    // ============================================================

    const recentOrders = (recentOrdersResult.rows ?? []).map(
      (order: {
        id: number | string;
        order_no: string;
        user_id: number | string;
        customer_name: string;
        email: string | null;
        phone: string | null;
        subtotal: number | string | null;
        shipping_rate: number | string | null;
        shipping_location: string | null;
        discount: number | string | null;
        total: number | string | null;
        payment_status: string | null;
        order_status: string | null;
        ordered_at: string | null;
        created_at: string;
        total_products: number | string;
        total_qty: number | string;
      }) => ({
        id: Number(order.id),
        orderNo: order.order_no,
        userId: Number(order.user_id),

        customer: {
          name: order.customer_name,
          email: order.email,
          phone: order.phone,
        },

        subtotal: Number(order.subtotal ?? 0),
        shippingRate: Number(order.shipping_rate ?? 0),
        shippingLocation: order.shipping_location,
        discount: Number(order.discount ?? 0),
        total: Number(order.total ?? 0),

        paymentStatus: order.payment_status,
        orderStatus: order.order_status,

        orderedAt: order.ordered_at,
        createdAt: order.created_at,

        totalProducts: Number(order.total_products ?? 0),
        totalQty: Number(order.total_qty ?? 0),
      })
    );

    // ============================================================
    // 10. FORMAT CUSTOMERS
    // ============================================================

    const customers = (customerListResult.rows ?? []).map(
      (customer: {
        id: number | string;
        name: string;
        email: string | null;
        phone: string | null;
        created_at: string;
        total_orders: number | string;
        total_spent: number | string;
      }) => ({
        id: Number(customer.id),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.created_at,

        totalOrders: Number(customer.total_orders ?? 0),

        totalSpent: Number(customer.total_spent ?? 0),
      })
    );

    // ============================================================
    // 11. FINAL RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,

      year: new Date().getFullYear(),

      stats: {
        totalCustomers: Number(
          customersCountResult.rows?.[0]?.total_customers ?? 0
        ),

        totalProducts: Number(
          productsCountResult.rows?.[0]?.total_products ?? 0
        ),

        monthlyOrders: Number(
          monthlyOrdersResult.rows?.[0]?.monthly_orders ?? 0
        ),

        monthlyRevenue: Number(
          monthlyRevenueResult.rows?.[0]?.monthly_revenue ?? 0
        ),
      },

      monthlySales,

      recentOrders,

      customers,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}
