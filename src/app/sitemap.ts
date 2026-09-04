import type { MetadataRoute } from "next";
import { readCatalogs } from "@/lib/catalogs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://ptcfurnitures.in";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/catalogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dealers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/payment`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  try {
    const catalogs = await readCatalogs();
    const dynamicCatalogRoutes: MetadataRoute.Sitemap = catalogs
      .filter((catalog) => catalog.type !== "pdf" && catalog.id)
      .map((catalog) => ({
        url: `${baseUrl}/catalogs/${catalog.id}`,
        lastModified: catalog.createdAt ? new Date(catalog.createdAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...dynamicCatalogRoutes];
  } catch {
    return staticRoutes;
  }
}
