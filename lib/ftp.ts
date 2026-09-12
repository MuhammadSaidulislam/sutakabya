import * as ftp from "basic-ftp";
import { Readable } from "stream";

export async function uploadImageFTP(
  buffer: Buffer,
  fileName: string,
  folder: string
): Promise<string> {
  const client = new ftp.Client();

  client.ftp.verbose = false;

  try {
    await client.access({
      host: process.env.FTP_HOST!,
      user: process.env.FTP_USER!,
      password: process.env.FTP_PASSWORD!,
      port: Number(process.env.FTP_PORT || 21),
      secure: false,
    });

    const remoteDir = `/${folder}`;

    await client.ensureDir(remoteDir);

    const stream = Readable.from(buffer);

    await client.uploadFrom(stream, fileName);

    return `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}/${folder}/${fileName}`;
  } catch (error) {
    console.error("FTP upload error:", error);

    throw new Error("FTP upload failed");
  } finally {
    client.close();
  }
}

export async function deleteImageFTP(
  imageUrl: string
): Promise<void> {
  const client = new ftp.Client();

  client.ftp.verbose = false;

  try {
    await client.access({
      host: process.env.FTP_HOST!,
      user: process.env.FTP_USER!,
      password: process.env.FTP_PASSWORD!,
      port: Number(process.env.FTP_PORT || 21),
      secure: false,
    });

    let ftpPath = decodeURIComponent(
      new URL(imageUrl).pathname
    );

    // Remove leading slash
    ftpPath = ftpPath.replace(/^\/+/, "");

    console.log("FTP Path:", ftpPath);

    await client.remove(ftpPath);

    console.log("Image deleted successfully");
  } catch (error) {
    console.error("FTP delete error:", error);

    throw new Error("FTP delete failed");
  } finally {
    client.close();
  }
}