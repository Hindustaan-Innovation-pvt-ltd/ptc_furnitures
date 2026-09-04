import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PTC Furnitures",
    short_name: "PTC Furnitures",
    description:
      "Explore premium furniture collections, ergonomic seating solutions, digital portfolios, and catalogs by PTC Furnitures.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090d",
    theme_color: "#b30d17",
    icons: [
      {
        src: "/logo-white.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
  };
}
