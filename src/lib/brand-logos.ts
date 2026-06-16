import { BrandLogoModel } from "./db-models";
import { connectToDatabase } from "./mongodb";

export type BrandLogo = {
  brand: string;
  src: string;
  alt: string;
  aliases: string[];
};

const defaultLogos: BrandLogo[] = [];

function normalizeBrand(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

let isSeeded = false;
let cacheLogos: BrandLogo[] | null = null;
let cacheLogosTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache TTL

export function clearLogoCache() {
  cacheLogos = null;
  cacheLogosTime = 0;
}

export async function loadLogosIntoCache() {
  if (isSeeded) return;
  try {
    const count = await BrandLogoModel.countDocuments();
    if (count === 0) {
      console.log("==> Seeding default brand logos into database...");
      await BrandLogoModel.insertMany([
        {
          brand: "PTC",
          src: "/PTC.png",
          alt: "PTC logo",
          aliases: ["ptc", "ptc furniture"],
        },
        {
          brand: "PTC-Gold",
          src: "/PTC-Gold.png",
          alt: "PTC Gold logo",
          aliases: ["ptc gold", "ptc-gold", "ptc gold furniture"],
        },
        {
          brand: "ALTECH",
          src: "/AL.png",
          alt: "ALTECH logo",
          aliases: ["altech"],
        },
      ]);
    }
    isSeeded = true;
  } catch (err) {
    console.error("Failed to seed default logos:", err);
  }
}

export async function getBrandLogos(): Promise<BrandLogo[]> {
  const now = Date.now();
  if (cacheLogos && now - cacheLogosTime < CACHE_TTL) {
    return cacheLogos;
  }

  await connectToDatabase();
  await loadLogosIntoCache();

  const docs = await BrandLogoModel.find().lean();
  cacheLogos = docs.map((doc: any) => ({
    brand: doc.brand,
    src: doc.src,
    alt: doc.alt,
    aliases: doc.aliases || [],
  }));
  cacheLogosTime = now;
  return cacheLogos;
}

export async function getBrandLogo(brand: string): Promise<BrandLogo | null> {
  const logos = await getBrandLogos();
  const normalized = normalizeBrand(brand);
  return (
    logos.find(
      (l) =>
        normalizeBrand(l.brand) === normalized ||
        l.aliases.some((alias) => normalizeBrand(alias) === normalized),
    ) ?? null
  );
}

export async function getBrandLogoSrc(brand: string): Promise<string | null> {
  const logo = await getBrandLogo(brand);
  return logo?.src ?? null;
}

export async function setBrandLogo(brand: string, logo: BrandLogo) {
  await connectToDatabase();

  const targetBrand = logo.brand.trim();
  const escapedBrand = targetBrand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const existing = await BrandLogoModel.findOne({
    brand: { $regex: new RegExp(`^${escapedBrand}$`, "i") },
  });

  if (existing) {
    await BrandLogoModel.updateOne(
      { _id: existing._id },
      {
        $set: {
          brand: logo.brand,
          src: logo.src,
          alt: logo.alt,
          aliases: logo.aliases || [],
        },
      },
    );
  } else {
    await BrandLogoModel.create({
      brand: logo.brand,
      src: logo.src,
      alt: logo.alt,
      aliases: logo.aliases || [],
    });
  }

  clearLogoCache();
}

