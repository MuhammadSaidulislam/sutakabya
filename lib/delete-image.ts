// lib/delete-image.ts

import fs from "fs/promises";
import path from "path";

export async function deleteImage(imagePath: string | null | undefined) {
  if (!imagePath) return;

  try {
    // imagePath example: /uploads/categories/abc123.jpg
    const filePath = path.join(process.cwd(), "public", imagePath);

    await fs.unlink(filePath);

    console.log("Deleted image:", filePath);
  } catch (error) {
    // Ignore if the file doesn't exist
    if (error) {
      console.error("Failed to delete image:", error);
      throw error;
    }
  }
}