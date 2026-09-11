import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

interface ExistingUser {
  id: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      password,
    }: {
      name: string;
      email?: string;
      phone?: string;
      password: string;
    } = body;

    // =====================================================
    // 1. Validation
    // =====================================================
    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, password, and email or phone are required.",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // 2. Check if user already exists
    // =====================================================
    const existingResult = await db.query<ExistingUser>(
      `
      SELECT id
      FROM customers
      WHERE (email IS NOT NULL AND email = $1)
         OR (phone IS NOT NULL AND phone = $2)
      LIMIT 1
      `,
      [email ?? null, phone ?? null]
    );

    const existing = existingResult.rows;

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists.",
        },
        { status: 409 }
      );
    }

    // =====================================================
    // 3. Hash password
    // =====================================================
    const hashedPassword = await bcrypt.hash(password, 10);

    // =====================================================
    // 4. Insert user
    // =====================================================
    const result = await db.query<{ id: number }>(
      `
      INSERT INTO customers
      (name, email, phone, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [
        name,
        email ?? null,
        phone ?? null,
        hashedPassword,
      ]
    );

    // Newly created user's ID
    const userId = result.rows[0].id;

    // =====================================================
    // 5. Create JWT
    // =====================================================
    const token = jwt.sign(
      {
        id: userId,
        name: name,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    // =====================================================
    // 6. Successful registration + automatic login
    // =====================================================
    const response = NextResponse.json({
      success: true,
      message: "Registration successful. You are now logged in.",
      passwordRequired: false,
      user: {
        id: userId,
        name,
        email: email ?? null,
        phone: phone ?? null,
      },
    });

    // =====================================================
    // 7. Set login cookie
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
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}