import { BrandLogoModel } from "./db-models";
import { connectToDatabase } from "./mongodb";

export type BrandLogo = {
  brand: string;
  src: string;
  alt: string;
  aliases: string[];
};

const defaultLogos: BrandLogo[] = [
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
];

let cachedLogos: Record<string, BrandLogo> = {};

function normalizeBrand(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function loadLogosIntoCache() {
  try {
    const docs = await BrandLogoModel.find().lean();
    const newCache: Record<string, BrandLogo> = {};
    for (const doc of docs) {
      newCache[normalizeBrand(doc.brand)] = {
        brand: doc.brand,
        src: doc.src,
        alt: doc.alt,
        aliases: doc.aliases || [],
      };
    }
    cachedLogos = newCache;
  } catch (err) {
    console.error("Failed to load dynamic logos into cache:", err);
  }
}

export function getBrandLogo(brand: string): BrandLogo | null {
  const normalized = normalizeBrand(brand);

  // 1. Check memory cache populated from DB
  const dynamicEntry = Object.values(cachedLogos).find(
    (entry) =>
      normalizeBrand(entry.brand) === normalized ||
      entry.aliases.some((alias) => normalizeBrand(alias) === normalized),
  );

  if (dynamicEntry) {
    return dynamicEntry;
  }

  // 2. Fall back to defaults
  return (
    defaultLogos.find(
      (entry) =>
        normalizeBrand(entry.brand) === normalized ||
        entry.aliases.some((alias) => normalizeBrand(alias) === normalized),
    ) ?? null
  );
}

export function getBrandLogoSrc(brand: string): string | null {
  return getBrandLogo(brand)?.src ?? null;
}

export function getBrandLogos(): BrandLogo[] {
  const mergedMap = new Map<string, BrandLogo>();

  // Add default logos
  for (const logo of defaultLogos) {
    mergedMap.set(normalizeBrand(logo.brand), logo);
  }

  // Override or add dynamic logos from database cache
  for (const logo of Object.values(cachedLogos)) {
    mergedMap.set(normalizeBrand(logo.brand), logo);
  }

  return Array.from(mergedMap.values());
}

export async function setBrandLogo(brand: string, logo: BrandLogo) {
  await connectToDatabase();

  const targetBrand = brand.trim();
  const normalized = normalizeBrand(targetBrand);

  await BrandLogoModel.findOneAndUpdate(
    { brand: { $regex: new RegExp(`^${targetBrand}$`, "i") } },
    {
      $set: {
        brand: logo.brand,
        src: logo.src,
        alt: logo.alt,
        aliases: logo.aliases || [],
      },
    },
    { upsert: true, new: true },
  );

  // Update memory cache
  cachedLogos[normalized] = logo;
}
