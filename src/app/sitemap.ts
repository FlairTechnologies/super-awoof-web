import type { MetadataRoute } from "next";

const SITE_URL = "https://www.superawoof.ng";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/subscribe`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/auth/signin`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
