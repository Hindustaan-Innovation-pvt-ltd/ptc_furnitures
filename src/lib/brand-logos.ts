export type BrandLogo = {
  brand: string;
  src: string;
  alt: string;
  aliases: string[];
};

const brandLogos: BrandLogo[] = [
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

function normalizeBrand(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getBrandLogo(brand: string): BrandLogo | null {
  const normalized = normalizeBrand(brand);

  return (
    brandLogos.find(
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
  return brandLogos;
}
