import type { MetadataRoute } from "next";

import { getPublicSiteData } from "@/lib/site-repository";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lacasadelpanal.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getPublicSiteData();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/catalogo`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contacto`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/checkout`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = data.products.map((product) => ({
    url: `${siteUrl}/producto/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
