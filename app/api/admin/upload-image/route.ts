import { NextRequest, NextResponse } from "next/server";
import ftp from "basic-ftp";
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

type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const client = new ftp.Client();

  try {
    const formData = await req.formData();

    const file = formData.get("image");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Image is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof folder !== "string" ||
      !ALLOWED_FOLDERS.includes(folder as UploadFolder)
    ) {
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

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must be less than 5MB.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalExtension = path.extname(file.name).toLowerCase();

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".avif",
    ];

    const extension = allowedExtensions.includes(originalExtension)
      ? originalExtension
      : ".jpg";

    const fileName = `${randomUUID()}${extension}`;

    const ftpRoot = process.env.FTP_ROOT || "/";

    const remoteFolder = `${ftpRoot}/${folder}`;
    const remotePath = `${remoteFolder}/${fileName}`;

    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      port: Number(process.env.FTP_PORT || 21),
      secure: true,
    });

    await client.ensureDir(remoteFolder);

    const { Readable } = await import("stream");

    const stream = Readable.from(buffer);

    await client.uploadFrom(stream, remotePath);

    const imageUrl =
      `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}` +
      `/${folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      image: imageUrl,
      fileName,
      folder,
    });
  } catch (error) {
    console.error("FTP upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed.",
      },
      { status: 500 }
    );
  } finally {
    client.close();
  }
}