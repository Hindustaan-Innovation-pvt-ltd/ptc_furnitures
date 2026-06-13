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
  } catch (err) {
    console.error("Failed to seed default logos:", err);
  }
}

export async function getBrandLogo(brand: string): Promise<BrandLogo | null> {
  await connectToDatabase();
  await loadLogosIntoCache();
  
  const normalized = normalizeBrand(brand);
  const escapedBrand = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const doc = await BrandLogoModel.findOne({
    $or: [
      { brand: { $regex: new RegExp(`^${escapedBrand}$`, "i") } },
      { aliases: { $regex: new RegExp(`^${escapedBrand}$`, "i") } }
    ]
  }).lean();

  if (doc) {
    return {
      brand: doc.brand,
      src: doc.src,
      alt: doc.alt,
      aliases: doc.aliases || [],
    };
  }

  return null;
}

export async function getBrandLogoSrc(brand: string): Promise<string | null> {
  const logo = await getBrandLogo(brand);
  return logo?.src ?? null;
}

export async function getBrandLogos(): Promise<BrandLogo[]> {
  await connectToDatabase();
  await loadLogosIntoCache();

  const docs = await BrandLogoModel.find().lean();
  return docs.map((doc: any) => ({
    brand: doc.brand,
    src: doc.src,
    alt: doc.alt,
    aliases: doc.aliases || [],
  }));
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
}
