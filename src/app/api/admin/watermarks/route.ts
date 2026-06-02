import "server-only";
import { NextResponse } from "next/server";
import { readBrandWatermarks, setBrandWatermark, BrandWatermark } from "@/lib/brand-watermarks";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  const map = readBrandWatermarks();
  return NextResponse.json({ watermarks: map });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.startsWith("multipart/form-data")) {
      const form = await request.formData();
      const brand = String(form.get("brand") ?? "").trim();
      const file = form.get("file") as File | null;

      if (!brand) {
        return NextResponse.json({ error: "Brand is required" }, { status: 400 });
      }

      if (!file) {
        return NextResponse.json({ error: "File is required" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString("base64");
      const mimeType = file.type || "image/png";
      const uploadedUrl = `data:${mimeType};base64,${base64}`;

      const size = String(form.get("size") ?? "medium");
      const opacity = Number(form.get("opacity") ?? 20);
      const position = String(form.get("position") ?? "center");
      const allowedPositions: NonNullable<BrandWatermark["position"]>[] = [
        "center",
        "north",
        "south",
        "east",
        "west",
        "north_east",
        "north_west",
        "south_east",
        "south_west",
      ];
      const safePosition = allowedPositions.includes(position as NonNullable<BrandWatermark["position"]>)
        ? (position as NonNullable<BrandWatermark["position"]>)
        : "center";

      const wm: BrandWatermark = {
        url: uploadedUrl,
        size: (size as BrandWatermark["size"]) ?? "medium",
        opacity: Number.isFinite(opacity) ? Math.max(0, Math.min(100, opacity)) : 20,
        position: safePosition,
      };

      await setBrandWatermark(brand, wm);

      return NextResponse.json({ brand, watermark: wm });
    }

    const body = await request.json();
    const brand = String(body.brand ?? "").trim();
    const watermarkUrl = String(body.watermark ?? "").trim();
    const size = String(body.size ?? "medium");
    const opacity = Number(body.opacity ?? 80);
    const position = String(body.position ?? "center");
    const allowedPositions: NonNullable<BrandWatermark["position"]>[] = [
      "center",
      "north",
      "south",
      "east",
      "west",
      "north_east",
      "north_west",
      "south_east",
      "south_west",
    ];
    const safePosition = allowedPositions.includes(position as NonNullable<BrandWatermark["position"]>)
      ? (position as NonNullable<BrandWatermark["position"]>)
      : "center";

    if (!brand || !watermarkUrl) {
      return NextResponse.json({ error: "brand and watermark are required" }, { status: 400 });
    }

    const wm: BrandWatermark = {
      url: watermarkUrl,
      size: (size as BrandWatermark["size"]) ?? "medium",
      opacity: Number.isFinite(opacity) ? Math.max(0, Math.min(100, opacity)) : 80,
      position: safePosition,
    };

    await setBrandWatermark(brand, wm);
    return NextResponse.json({ brand, watermark: wm });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
