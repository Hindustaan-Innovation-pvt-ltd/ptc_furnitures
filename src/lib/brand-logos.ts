import fs from "node:fs";
import path from "node:path";

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

const dataDirectory = path.join(process.cwd(), "data");
const logosFile = path.join(dataDirectory, "brand-logos.json");

function readDynamicLogos(): Record<string, BrandLogo> {
  try {
    if (fs.existsSync(logosFile)) {
      const content = fs.readFileSync(logosFile, "utf8");
      return JSON.parse(content) || {};
    }
  } catch {
    // ignore
  }
  return {};
}

function writeDynamicLogos(logos: Record<string, BrandLogo>) {
  try {
    fs.mkdirSync(dataDirectory, { recursive: true });
    fs.writeFileSync(logosFile, JSON.stringify(logos, null, 2), "utf8");
  } catch {
    // ignore
  }
}

function normalizeBrand(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getBrandLogo(brand: string): BrandLogo | null {
  const normalized = normalizeBrand(brand);
  
  // 1. Check dynamic database first
  const dynamicLogos = readDynamicLogos();
  const dynamicEntry = Object.values(dynamicLogos).find(
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
  const dynamicLogos = readDynamicLogos();
  const mergedMap = new Map<string, BrandLogo>();

  // Add default logos
  for (const logo of defaultLogos) {
    mergedMap.set(normalizeBrand(logo.brand), logo);
  }

  // Override or add dynamic logos
  for (const logo of Object.values(dynamicLogos)) {
    mergedMap.set(normalizeBrand(logo.brand), logo);
  }

  return Array.from(mergedMap.values());
}

export function setBrandLogo(brand: string, logo: BrandLogo) {
  const dynamicLogos = readDynamicLogos();
  dynamicLogos[normalizeBrand(brand)] = logo;
  writeDynamicLogos(dynamicLogos);
}
