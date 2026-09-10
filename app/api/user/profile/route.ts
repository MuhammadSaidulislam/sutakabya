import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

interface JwtPayload {
  id: number;
}

interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  profile_image: string | null;
  status: string;
  created_at: Date;
}

function getUserId(req: NextRequest): number | null {
  const token = req.cookies.get("user_token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);

   if (!userId) {
  return new NextResponse(null, {
    status: 204,
  });
}

    const [rows] = await db.query<User[]>(
      `
      SELECT
        id,
        name,
        email,
        phone,
        gender,
        profile_image,
        status,
        created_at
      FROM customers
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (!rows.length) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const {
      name,
      gender,
      profile_image,
    } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required.",
        },
        { status: 400 }
      );
    }

    await db.query<ResultSetHeader>(
      `
      UPDATE customers
      SET
        name = ?,
        gender = ?,
        profile_image = ?
      WHERE id = ?
      `,
      [
        name.trim(),
        gender || null,
        profile_image || null,
        userId,
      ]
    );

    const [rows] = await db.query<User[]>(
      `
      SELECT
        id,
        name,
        email,
        phone,
        gender,
        profile_image,
        status,
        created_at
      FROM customers
      WHERE id = ?
      `,
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}