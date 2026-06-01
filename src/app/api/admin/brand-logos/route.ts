import "server-only";
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getBrandLogo, setBrandLogo } from "@/lib/brand-logos";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const brand = String(form.get("brand") ?? "").trim();
    const file = form.get("file") as File | null;

    if (!brand) {
      return NextResponse.json({ error: "Brand is required." }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "Logo file is required." }, { status: 400 });
    }

    let logo = getBrandLogo(brand);

    // If it doesn't exist, we create a new dynamic entry!
    if (!logo) {
      const safeSlug = brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      logo = {
        brand,
        src: `/uploads/logos/${safeSlug}.png`,
        alt: `${brand} logo`,
        aliases: [brand.toLowerCase()],
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const outputPath = path.join(process.cwd(), "public", logo.src.replace(/^\//, ""));

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(buffer).png().toFile(outputPath);

    // Persist in dynamic database
    setBrandLogo(brand, logo);

    return NextResponse.json({ brand, src: logo.src });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save brand logo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
