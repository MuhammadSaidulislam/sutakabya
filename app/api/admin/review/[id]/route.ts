import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

interface ReviewRow extends RowDataPacket {
  id: number;
}

const allowedStatuses = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

type ReviewStatus = (typeof allowedStatuses)[number];

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
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

    if (
      !adminId ||
      Number.isNaN(adminId)
    ) {
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

    const status = String(
      body.status || ""
    ).trim().toUpperCase();

    // ============================================================
    // VALIDATE STATUS
    // ============================================================

    if (
      !allowedStatuses.includes(
        status as ReviewStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid status. Status must be PENDING, APPROVED, or REJECTED",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // CHECK REVIEW EXISTS
    // ============================================================

    const [reviews] =
      await db.query<ReviewRow[]>(
        `
        SELECT
          id
        FROM product_reviews
        WHERE id = ?
        LIMIT 1
        `,
        [reviewId]
      );

    if (reviews.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Review not found",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // UPDATE REVIEW STATUS
    // ============================================================

    await db.query(
      `
      UPDATE product_reviews
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        status,
        reviewId,
      ]
    );

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,
      message: "Review status updated successfully",
      review_id: reviewId,
      status,
    });
  } catch (error) {
    console.error(
      "PUT admin review error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update review status",
      },
      { status: 500 }
    );
  }
}