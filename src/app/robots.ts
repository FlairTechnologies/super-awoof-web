import type { MetadataRoute } from "next";

/**
 * Signed-in areas carry nothing a search engine should hold, and indexing the
 * auth screens only competes with the pages that should rank.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/dashboard/", "/auth/"],
      },
    ],
    sitemap: "https://www.superawoof.ng/sitemap.xml",
  };
}
