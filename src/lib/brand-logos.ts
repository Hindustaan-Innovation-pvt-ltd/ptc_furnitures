import { BrandLogoModel } from "./db-models";
import { connectToDatabase } from "./mongodb";

export type BrandLogo = {
  brand: string;
  src: string;
  alt: string;
  aliases: string[];
};

const defaultLogos: BrandLogo[] = [];

let cachedLogos: Record<string, BrandLogo> = {};

function normalizeBrand(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function loadLogosIntoCache() {
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

    const docs = await BrandLogoModel.find().lean();
    console.log(`==> [Cache Load] Loaded ${docs.length} brand logos from DB.`);
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

  // Reload memory cache from database to ensure consistency
  await loadLogosIntoCache();
}
