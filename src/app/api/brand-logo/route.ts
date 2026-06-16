import { headers } from "next/headers";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getBrandLogo, loadLogosIntoCache } from "@/lib/brand-logos";
import { StoredFile } from "@/lib/db-models";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
  await headers();
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand") || "";

    await connectToDatabase();
    await loadLogosIntoCache();

    let logo = await getBrandLogo(brand);
    if (!logo) {
      logo = await getBrandLogo("PTC");
    }

    if (!logo) {
      return new NextResponse("Not Found", { status: 404 });
    }

    let contentType = "image/png";
    let buffer: Buffer;

    if (logo.src.startsWith("data:")) {
      const parts = logo.src.split(",");
      contentType = parts[0].match(/:(.*?);/)?.[1] || "image/png";
      buffer = Buffer.from(parts[1], "base64");
    } else if (logo.src.startsWith("/api/images")) {
      const urlObj = new URL(logo.src, "http://localhost");
      const fileId = urlObj.searchParams.get("id");
      if (!fileId) return new NextResponse("Not Found", { status: 404 });
      const storedFile = await StoredFile.findById(fileId);
      if (!storedFile) return new NextResponse("Not Found", { status: 404 });
      contentType = storedFile.contentType || "image/png";
      buffer = Buffer.from(storedFile.data);
    } else {
      const filePath = path.join(
        process.cwd(),
        "public",
        logo.src.replace(/^\//, ""),
      );
      try {
        buffer = await fs.readFile(filePath);
      } catch (err: any) {
        if (logo.src.startsWith("/upload/") || logo.src.startsWith("/uploads/")) {
          try {
            console.log(`==> [Brand Logo API] Local file not found: ${filePath}. Fetching remote fallback from production: https://ptcfurnitures.com${logo.src}`);
            const response = await fetch(`https://ptcfurnitures.com${logo.src}`);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              buffer = Buffer.from(arrayBuffer);
            } else {
              throw err;
            }
          } catch (fetchErr) {
            console.error(`==> [Brand Logo API] Failed to fetch fallback brand logo:`, fetchErr);
            throw err;
          }
        } else {
          throw err;
        }
      }
      if (logo.src.endsWith(".svg")) {
        contentType = "image/svg+xml";
      } else if (logo.src.endsWith(".webp")) {
        contentType = "image/webp";
      } else if (logo.src.endsWith(".jpg") || logo.src.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Failed to serve brand logo:", error);
    try {
      const fallbackPath = path.join(process.cwd(), "public", "logo-dark.svg");
      const buffer = await fs.readFile(fallbackPath);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }
}
