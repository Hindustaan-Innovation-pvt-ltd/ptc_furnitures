import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  compositeBrandWatermark,
  removeWhiteBackground,
} from "@/lib/image-processor";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const src = searchParams.get("src") || "";
    const brand = searchParams.get("brand") || "";

    if (!src) {
      return new NextResponse("Missing src parameter", { status: 400 });
    }

    await connectToDatabase();

    let imageBuffer: Buffer;

    if (src.startsWith("/")) {
      const filePath = path.join(
        process.cwd(),
        "public",
        src.replace(/^\//, ""),
      );
      imageBuffer = await fs.readFile(filePath);
    } else if (src.startsWith("data:")) {
      const parts = src.split(",");
      imageBuffer = Buffer.from(parts[1], "base64");
    } else {
      const res = await fetch(src);
      if (!res.ok) {
        return new NextResponse("Failed to fetch image", { status: 502 });
      }
      imageBuffer = Buffer.from(await res.arrayBuffer());
    }

    // 1. Remove white background
    const cleanBuffer = await removeWhiteBackground(imageBuffer);

    // 2. Add brand watermark
    const watermarkedBuffer = await compositeBrandWatermark(cleanBuffer, brand);

    return new NextResponse(new Uint8Array(watermarkedBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("Failed to generate watermarked download:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
