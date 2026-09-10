import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

interface UserTokenPayload {
  id: number;
  name?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    }: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = body;

    // =====================================================
    // 1. Validate input
    // =====================================================

    if (!currentPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is required.",
        },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password is required.",
        },
        { status: 400 }
      );
    }

    if (!confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Please confirm your new password.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New passwords do not match.",
        },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password must be different from your current password.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 2. Get user token
    // =====================================================

    const userToken = req.cookies.get("user_token")?.value;

    if (!userToken) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not logged in. Please login first.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 3. Verify user token
    // =====================================================

    let decoded: UserTokenPayload;

    try {
      decoded = jwt.verify(
        userToken,
        process.env.JWT_SECRET!
      ) as UserTokenPayload;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your login session has expired. Please login again.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 4. Validate user ID from token
    // =====================================================

    if (!decoded.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login session.",
        },
        { status: 401 }
      );
    }

    // =====================================================
    // 5. Find customer
    // =====================================================

    const [users] = await db.query<RowDataPacket[]>(
      `
      SELECT id, name, email, phone, password
      FROM customers
      WHERE id = ?
      LIMIT 1
      `,
      [decoded.id]
    );

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Account not found.",
        },
        { status: 404 }
      );
    }

    const user = users[0];

    // =====================================================
    // 6. Make sure account has a password
    // =====================================================

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account does not have a password. Please use the password reset option.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 7. Verify current password
    // =====================================================

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 8. Hash new password
    // =====================================================

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // =====================================================
    // 9. Update password
    // =====================================================

    await db.query(
      `
      UPDATE customers
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, user.id]
    );

    // =====================================================
    // 10. Create new login JWT
    // =====================================================

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    // =====================================================
    // 11. Create response
    // =====================================================

    const response = NextResponse.json({
      success: true,
      message: "Password changed successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

    // =====================================================
    // 12. Refresh login session
    // =====================================================

    response.cookies.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}