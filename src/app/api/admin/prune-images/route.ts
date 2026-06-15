import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  BrandLogoModel,
  BrandWatermarkModel,
  Product,
} from "@/lib/db-models";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // 1. Collect all referenced filenames from Database
    const referencedFiles = new Set<string>();

    // Products
    const products = await Product.find({}).lean();
    for (const prod of products) {
      const pathsToCheck = [
        ...(prod.images || []),
        ...(prod.originalImages || []),
        prod.frontImage,
        prod.backImage,
        prod.originalFrontImage,
        prod.originalBackImage,
      ];

      for (const p of pathsToCheck) {
        if (typeof p === "string" && p.startsWith("/upload/")) {
          const filename = p.replace(/^\/upload\//, "").split("?")[0];
          if (filename) referencedFiles.add(filename);
        }
      }
    }

    // Brand Logos
    const logos = await BrandLogoModel.find({}).lean();
    for (const logo of logos) {
      if (typeof logo.src === "string" && logo.src.startsWith("/upload/")) {
        const filename = logo.src.replace(/^\/upload\//, "").split("?")[0];
        if (filename) referencedFiles.add(filename);
      }
    }

    // Brand Watermarks
    const watermarks = await BrandWatermarkModel.find({}).lean();
    for (const wm of watermarks) {
      if (typeof wm.url === "string" && wm.url.startsWith("/upload/")) {
        const filename = wm.url.replace(/^\/upload\//, "").split("?")[0];
        if (filename) referencedFiles.add(filename);
      }
    }

    // 2. Scan public/upload folder
    const uploadDir = path.join(process.cwd(), "public", "upload");
    let filesInDir: string[] = [];
    try {
      filesInDir = await fs.readdir(uploadDir);
    } catch (e) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        spaceSavedBytes: 0,
        message: "No upload directory found.",
      });
    }

    let deletedCount = 0;
    let spaceSavedBytes = 0;

    for (const filename of filesInDir) {
      // Preserve system or configuration files
      if (filename === ".gitkeep" || filename === "README.md") {
        continue;
      }

      if (!referencedFiles.has(filename)) {
        const filePath = path.join(uploadDir, filename);
        try {
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            await fs.unlink(filePath);
            deletedCount++;
            spaceSavedBytes += stats.size;
          }
        } catch (err) {
          console.error(`Failed to delete file: ${filename}`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalFiles: filesInDir.length,
      deletedCount,
      spaceSavedBytes,
    });
  } catch (error) {
    console.error("==> [Prune Images API Error]:", error);
    const message =
      error instanceof Error ? error.message : "Unable to prune images.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
