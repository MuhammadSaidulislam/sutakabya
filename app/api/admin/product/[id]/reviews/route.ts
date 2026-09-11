import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (!productId || Number.isNaN(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number(searchParams.get("limit")) || 10
      )
    );

    const offset = (page - 1) * limit;

    // ============================================================
    // CHECK PRODUCT EXISTS
    // ============================================================

    const productResult = await db.query<{ id: number }>(
      `
      SELECT id
      FROM products
      WHERE id = $1
      LIMIT 1
      `,
      [productId]
    );

    const productRows = productResult.rows;

    if (!productRows.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // RATING SUMMARY
    // ============================================================

    const summaryResult = await db.query<{
      rating_count: string | number;
      average_rating: string | number;
      five_star: string | number | null;
      four_star: string | number | null;
      three_star: string | number | null;
      two_star: string | number | null;
      one_star: string | number | null;
    }>(
      `
      SELECT
        COUNT(*) AS rating_count,

        COALESCE(
          ROUND(AVG(rating)::numeric, 1),
          0
        ) AS average_rating,

        SUM(
          CASE
            WHEN rating = 5 THEN 1
            ELSE 0
          END
        ) AS five_star,

        SUM(
          CASE
            WHEN rating = 4 THEN 1
            ELSE 0
          END
        ) AS four_star,

        SUM(
          CASE
            WHEN rating = 3 THEN 1
            ELSE 0
          END
        ) AS three_star,

        SUM(
          CASE
            WHEN rating = 2 THEN 1
            ELSE 0
          END
        ) AS two_star,

        SUM(
          CASE
            WHEN rating = 1 THEN 1
            ELSE 0
          END
        ) AS one_star

      FROM product_reviews

      WHERE product_id = $1
        AND status = 'APPROVED'
      `,
      [productId]
    );

    const summary = summaryResult.rows[0];

    // ============================================================
    // TOTAL REVIEWS
    // ============================================================

    const countResult = await db.query<{
      total: string | number;
    }>(
      `
      SELECT COUNT(*) AS total
      FROM product_reviews
      WHERE product_id = $1
        AND status = 'APPROVED'
      `,
      [productId]
    );

    const total = Number(
      countResult.rows[0]?.total ?? 0
    );

    // ============================================================
    // REVIEWS
    // ============================================================

    const reviewsResult = await db.query(
      `
      SELECT
        pr.id,
        pr.product_id,
        pr.user_id,
        pr.rating,
        pr.review,
        pr.created_at,
        pr.updated_at

      FROM product_reviews pr

      WHERE pr.product_id = $1
        AND pr.status = 'APPROVED'

      ORDER BY pr.created_at DESC

      LIMIT $2
      OFFSET $3
      `,
      [productId, limit, offset]
    );

    const reviews = reviewsResult.rows;

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,

      data: {
        summary: {
          average_rating: Number(
            summary?.average_rating || 0
          ),

          rating_count: Number(
            summary?.rating_count || 0
          ),

          ratings: {
            5: Number(summary?.five_star || 0),
            4: Number(summary?.four_star || 0),
            3: Number(summary?.three_star || 0),
            2: Number(summary?.two_star || 0),
            1: Number(summary?.one_star || 0),
          },
        },

        reviews,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get product reviews error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}