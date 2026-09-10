import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_FOLDERS = [
  "categories",
  "products",
  "campaigns",
  "blogs",
  "banners",
  "brands",
  "avatars",
] as const;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("image") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Image is required.",
        },
        { status: 400 }
      );
    }

    if (!folder || !ALLOWED_FOLDERS.includes(folder as typeof ALLOWED_FOLDERS[number])) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid upload folder.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only image files are allowed.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);

    const fileName = `${randomUUID()}${ext}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      folder
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    await fs.writeFile(
      path.join(uploadDir, fileName),
      buffer
    );

    return NextResponse.json({
      success: true,
      image: `/uploads/${folder}/${fileName}`,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}