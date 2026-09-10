import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import {db} from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { searchParams } = new URL(req.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );

    const offset = (page - 1) * limit;

    // Check product exists
    const [productRows] = await db.query<RowDataPacket[]>(
      `
      SELECT id
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!productRows.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Rating summary
    const [summaryRows] = await db.query<RowDataPacket[]>(
      `
      SELECT
        COUNT(*) AS rating_count,
        COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating,

        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star

      FROM product_reviews
      WHERE product_id = ?
        AND status = 'APPROVED'
      `,
      [id]
    );

    const summary = summaryRows[0];

    // Total reviews
    const [countRows] = await db.query<RowDataPacket[]>(
      `
      SELECT COUNT(*) AS total
      FROM product_reviews
      WHERE product_id = ?
        AND status = 'APPROVED'
      `,
      [id]
    );

    const total = Number(countRows[0].total);

    // Reviews
    const [reviews] = await db.query<RowDataPacket[]>(
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

      WHERE pr.product_id = ?
        AND pr.status = 'APPROVED'

      ORDER BY pr.created_at DESC

      LIMIT ? OFFSET ?
      `,
      [id, limit, offset]
    );

    return NextResponse.json({
      success: true,

      data: {
        summary: {
          average_rating: Number(summary.average_rating || 0),
          rating_count: Number(summary.rating_count || 0),

          ratings: {
            5: Number(summary.five_star || 0),
            4: Number(summary.four_star || 0),
            3: Number(summary.three_star || 0),
            2: Number(summary.two_star || 0),
            1: Number(summary.one_star || 0),
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
    console.error("Get product reviews error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}