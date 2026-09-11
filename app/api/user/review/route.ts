import { NextRequest, NextResponse } from "next/server";
import  db  from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { verifyToken } from '@/lib/auth';
interface CountRow {
  total: number;
}

export async function GET(request: NextRequest) {
  try {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    const userId = Number(payload.id);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // SEARCH PARAMS
    // ============================================================

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 12, 1),
      100
    );

    const offset = (page - 1) * limit;

    // Search
    const search =
      searchParams.get("search")?.trim() || "";

    const searchValue = `%${search}%`;

    // ============================================================
    // TOTAL COUNT
    // ============================================================

    const countResult = await db.query<{ total: string }>(
      `
      SELECT COUNT(*) AS total
      FROM orders o

      INNER JOIN order_items oi
        ON oi.order_id = o.id

      INNER JOIN products p
        ON p.id = oi.product_id

      WHERE o.user_id = $1
        AND o.order_status = 'DELIVERED'
        AND (
          $2 = ''
          OR p.name ILIKE $3
          OR p.sku ILIKE $4
        )
      `,
      [
        userId,
        search,
        searchValue,
        searchValue,
      ]
    );

    const total = Number(
      countResult.rows[0]?.total || 0
    );

    const totalPages = Math.ceil(total / limit);

    // ============================================================
    // GET DELIVERED ORDERS + PRODUCTS + REVIEWS
    // ============================================================

    const rowsResult = await db.query(
      `
      SELECT

        /* =========================
           ORDER
        ========================= */

        o.id AS order_id,
        o.order_no,
        o.order_status,
        o.ordered_at,

        /* =========================
           ORDER ITEM
        ========================= */

        oi.id AS order_item_id,
        oi.product_id,
        oi.qty,
        oi.price AS item_price,
        oi.subtotal AS item_subtotal,
        oi.status AS item_status,

        /* =========================
           PRODUCT
        ========================= */

        p.name AS product_name,
        p.sku AS product_sku,
        p.price AS product_price,

        /* =========================
           PRODUCT THUMBNAIL
        ========================= */

        pi.image_url AS product_image,

        /* =========================
           REVIEW
        ========================= */

        pr.id AS review_id,
        pr.rating AS review_rating,
        pr.review AS review_text,
        pr.status AS review_status,
        pr.created_at AS review_created_at,
        pr.updated_at AS review_updated_at

      FROM orders o

      INNER JOIN order_items oi
        ON oi.order_id = o.id

      INNER JOIN products p
        ON p.id = oi.product_id

      LEFT JOIN product_images pi
        ON pi.product_id = oi.product_id
        AND pi.is_thumbnail = true

      LEFT JOIN product_reviews pr
        ON pr.order_id = o.id
        AND pr.product_id = oi.product_id
        AND pr.user_id = o.user_id

      WHERE o.user_id = $1
        AND o.order_status = 'DELIVERED'
        AND (
          $2 = ''
          OR p.name ILIKE $3
          OR p.sku ILIKE $4
        )

      ORDER BY
        o.created_at DESC,
        oi.id ASC

      LIMIT $5 OFFSET $6
      `,
      [
        userId,
        search,
        searchValue,
        searchValue,
        limit,
        offset,
      ]
    );

    const rows = rowsResult.rows;

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

        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("GET reviews error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    // JWT contains `id`, not `userId`
    const userId = Number(payload.id);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // REQUEST BODY
    // ============================================================

    const body = await request.json();

    const productId = Number(body.product_id);
    const orderId = Number(body.order_id);
    const rating = Number(body.rating);
    const review = String(body.review || "").trim();

    // ============================================================
    // VALIDATION
    // ============================================================

    if (
      !productId ||
      Number.isNaN(productId) ||
      !orderId ||
      Number.isNaN(orderId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Product and order are required",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: "Review is required",
        },
        { status: 400 }
      );
    }

    // Optional maximum review length
    if (review.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Review cannot exceed 2000 characters",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // CHECK ORDER
    // ============================================================

    const orderResult = await db.query<{ id: number }>(
      `
      SELECT id
      FROM orders
      WHERE id = $1
        AND user_id = $2
        AND order_status = 'DELIVERED'
      LIMIT 1
      `,
      [orderId, userId]
    );

    const orders = orderResult.rows;

    if (orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You can only review products from delivered orders",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // CHECK PRODUCT EXISTS IN THIS ORDER
    // ============================================================

    const orderItemResult = await db.query<{ id: number }>(
      `
      SELECT id
      FROM order_items
      WHERE order_id = $1
        AND product_id = $2
      LIMIT 1
      `,
      [orderId, productId]
    );

    const orderItems = orderItemResult.rows;

    if (orderItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This product does not belong to the specified order",
        },
        { status: 403 }
      );
    }

    // ============================================================
    // CHECK DUPLICATE REVIEW
    // ============================================================

    const existingReviewResult = await db.query<{ id: number }>(
      `
      SELECT id
      FROM product_reviews
      WHERE user_id = $1
        AND order_id = $2
        AND product_id = $3
      LIMIT 1
      `,
      [userId, orderId, productId]
    );

    const existingReviews = existingReviewResult.rows;

    if (existingReviews.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already reviewed this product",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // INSERT REVIEW
    // ============================================================

    const result = await db.query<{ id: number }>(
      `
      INSERT INTO product_reviews
      (
        product_id,
        user_id,
        order_id,
        rating,
        review,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
      RETURNING id
      `,
      [
        productId,
        userId,
        orderId,
        rating,
        review,
      ]
    );

    const reviewId = result.rows[0].id;

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        review_id: reviewId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST review error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit review",
      },
      { status: 500 }
    );
  }
}
