import fs from "node:fs/promises";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");
const filePath = path.join(dataDirectory, "brand-watermarks.json");

async function ensureFile() {
  await fs.mkdir(dataDirectory, { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify({}, null, 2), "utf8");
  }
}

export type BrandWatermark = {
  url: string;
  size?: "small" | "medium" | "large";
  opacity?: number; // 0-100
  position?:
    | "center"
    | "north"
    | "south"
    | "east"
    | "west"
    | "north_east"
    | "north_west"
    | "south_east"
    | "south_west";
};

export async function readBrandWatermarks(): Promise<Record<string, BrandWatermark>> {
  await ensureFile();

  try {
    const contents = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(contents);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, BrandWatermark>;
    }
  } catch {
    // ignore
  }

  return {};
}

export async function setBrandWatermark(
  brand: string,
  watermark: BrandWatermark,
): Promise<void> {
  const normalized = brand.trim();
  if (!normalized) throw new Error("Brand name required");

  const map = await readBrandWatermarks();
  map[normalized] = watermark;
  await fs.writeFile(filePath, JSON.stringify(map, null, 2), "utf8");
}

export async function removeBrandWatermark(brand: string): Promise<void> {
  const map = await readBrandWatermarks();
  delete map[brand.trim()];
  await fs.writeFile(filePath, JSON.stringify(map, null, 2), "utf8");
}
