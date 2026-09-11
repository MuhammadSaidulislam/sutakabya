import { NextRequest, NextResponse } from "next/server";
import  db  from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

// ============================================================
// TYPES
// ============================================================

interface CountRow extends RowDataPacket {
  total: number;
}

// ============================================================
// GET ALL REVIEWS - ADMIN
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const token =
      request.cookies.get("admin_token")?.value;

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

    const adminId = Number(payload.id);

    if (!adminId || Number.isNaN(adminId)) {
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

    // ============================================================
    // PAGINATION
    // ============================================================

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit")) || 12,
        1
      ),
      100
    );

    const offset = (page - 1) * limit;

    // ============================================================
    // SEARCH
    // ============================================================

    const search =
      searchParams.get("search")?.trim() || "";

    const searchValue = `%${search}%`;

    // ============================================================
    // STATUS FILTER
    // ============================================================

    const status =
      searchParams.get("status")?.trim() || "";

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];

    const validStatus = allowedStatuses.includes(status)
      ? status
      : "";

    // ============================================================
    // RATING FILTER
    // ============================================================

    const ratingParam =
      searchParams.get("rating")?.trim() || "";

    let validRating: number | null = null;

    if (ratingParam !== "") {
      const parsedRating = Number(ratingParam);

      if (
        Number.isInteger(parsedRating) &&
        parsedRating >= 1 &&
        parsedRating <= 5
      ) {
        validRating = parsedRating;
      }
    }

    // ============================================================
    // BUILD FILTERS
    // ============================================================

    const conditions: string[] = [];
    const filterParams: (string | number)[] = [];

    // ------------------------------------------------------------
    // Search
    // ------------------------------------------------------------

    if (search) {
      filterParams.push(searchValue);
      const productNameParam = `$${filterParams.length}`;

      filterParams.push(searchValue);
      const productSkuParam = `$${filterParams.length}`;

      filterParams.push(searchValue);
      const customerNameParam = `$${filterParams.length}`;

      filterParams.push(searchValue);
      const customerEmailParam = `$${filterParams.length}`;

      filterParams.push(searchValue);
      const customerPhoneParam = `$${filterParams.length}`;

      filterParams.push(searchValue);
      const orderNoParam = `$${filterParams.length}`;

      conditions.push(`
        (
          p.name ILIKE ${productNameParam}
          OR p.sku ILIKE ${productSkuParam}
          OR c.name ILIKE ${customerNameParam}
          OR c.email ILIKE ${customerEmailParam}
          OR c.phone ILIKE ${customerPhoneParam}
          OR o.order_no ILIKE ${orderNoParam}
        )
      `);
    }

    // ------------------------------------------------------------
    // Status
    // ------------------------------------------------------------

    if (validStatus) {
      filterParams.push(validStatus);

      conditions.push(
        `pr.status = $${filterParams.length}`
      );
    }

    // ------------------------------------------------------------
    // Rating
    // ------------------------------------------------------------

    if (validRating !== null) {
      filterParams.push(validRating);

      conditions.push(
        `pr.rating = $${filterParams.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // ============================================================
    // TOTAL COUNT
    // ============================================================

    const countResult = await db.query<CountRow>(
      `
      SELECT
        COUNT(*) AS total

      FROM product_reviews pr

      INNER JOIN products p
        ON p.id = pr.product_id

      INNER JOIN orders o
        ON o.id = pr.order_id

      INNER JOIN customers c
        ON c.id = pr.user_id

      ${whereClause}
      `,
      filterParams
    );

    const total = Number(
      countResult.rows[0]?.total || 0
    );

    const totalPages = Math.ceil(
      total / limit
    );

    // ============================================================
    // GET REVIEWS
    // ============================================================

    const reviewParams = [
      ...filterParams,
      limit,
      offset,
    ];

    const limitParam =
      `$${filterParams.length + 1}`;

    const offsetParam =
      `$${filterParams.length + 2}`;

    const reviewsResult =
      await db.query(
        `
        SELECT

          /* ======================================================
             REVIEW
          ====================================================== */

          pr.id,
          pr.product_id,
          pr.user_id,
          pr.order_id,

          pr.rating,
          pr.review,
          pr.status,

          pr.created_at,
          pr.updated_at,

          /* ======================================================
             PRODUCT
          ====================================================== */

          p.name AS product_name,
          p.sku AS product_sku,
          p.price AS product_price,

          /* ======================================================
             PRODUCT THUMBNAIL
          ====================================================== */

          (
            SELECT
              pi.image_url

            FROM product_images pi

            WHERE pi.product_id = p.id
              AND pi.is_thumbnail = true

            ORDER BY pi.id ASC

            LIMIT 1
          ) AS product_image,

          /* ======================================================
             CUSTOMER
          ====================================================== */

          c.name AS customer_name,
          c.email AS customer_email,
          c.phone AS customer_phone,

          /* ======================================================
             ORDER
          ====================================================== */

          o.order_no,
          o.order_status,
          o.ordered_at

        FROM product_reviews pr

        /* ========================================================
           PRODUCT
        ======================================================== */

        INNER JOIN products p
          ON p.id = pr.product_id

        /* ========================================================
           ORDER
        ======================================================== */

        INNER JOIN orders o
          ON o.id = pr.order_id

        /* ========================================================
           CUSTOMER
        ======================================================== */

        INNER JOIN customers c
          ON c.id = pr.user_id

        ${whereClause}

        /* ========================================================
           SORT
        ======================================================== */

        ORDER BY
          pr.created_at DESC,
          pr.id DESC

        /* ========================================================
           PAGINATION
        ======================================================== */

        LIMIT ${limitParam}
        OFFSET ${offsetParam}
        `,
        reviewParams
      );

    const rows = reviewsResult.rows;

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

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "GET admin reviews error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}