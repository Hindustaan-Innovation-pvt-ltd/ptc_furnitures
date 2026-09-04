import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/cgi-bin/",
          "/_next/static/media/",
        ],
      },
    ],
    sitemap: "https://ptcfurnitures.in/sitemap.xml",
  };
}
