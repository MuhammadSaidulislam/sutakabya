import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface Params {
  params: Promise<{
    id: string;
  }>;
}


export async function PUT(
  request: NextRequest,
  { params }: Params
) {
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
    // REVIEW ID
    // ============================================================

    const { id } = await params;

    const reviewId = Number(id);

    if (
      !reviewId ||
      Number.isNaN(reviewId) ||
      !Number.isInteger(reviewId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid review ID",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // REQUEST BODY
    // ============================================================

    const body = await request.json();

    const rating = Number(body.rating);
    const review = String(body.review || "").trim();

    // ============================================================
    // VALIDATE RATING
    // ============================================================

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

    // ============================================================
    // VALIDATE REVIEW
    // ============================================================

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: "Review is required",
        },
        { status: 400 }
      );
    }

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
    // VERIFY REVIEW OWNERSHIP + DELIVERED ORDER
    // ============================================================

    const [reviews] = await db.query<RowDataPacket[]>(
      `
      SELECT
        pr.id
      FROM product_reviews pr

      INNER JOIN orders o
        ON o.id = pr.order_id

      WHERE pr.id = ?
        AND pr.user_id = ?
        AND o.user_id = ?
        AND o.order_status = 'DELIVERED'

      LIMIT 1
      `,
      [
        reviewId,
        userId,
        userId,
      ]
    );

    if (reviews.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Review not found or cannot be updated",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // UPDATE REVIEW
    // ============================================================

    await db.query(
      `
      UPDATE product_reviews
      SET
        rating = ?,
        review = ?,
        status = 'PENDING',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND user_id = ?
      `,
      [
        rating,
        review,
        reviewId,
        userId,
      ]
    );

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      review_id: reviewId,
    });
  } catch (error) {
    console.error("PUT review error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update review",
      },
      { status: 500 }
    );
  }
}