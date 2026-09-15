import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { mediaItems } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const revalidate = 86400; // Daily revalidation

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cinetrack.xyz";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const cachedMedia = await db
      .select({
        id: mediaItems.id,
        mediaType: mediaItems.mediaType,
        sourceId: mediaItems.sourceId,
        updatedAt: mediaItems.updatedAt,
      })
      .from(mediaItems)
      .orderBy(desc(mediaItems.updatedAt))
      .limit(250);

    const mediaRoutes: MetadataRoute.Sitemap = cachedMedia.map((item) => {
      const type =
        item.mediaType === "movie"
          ? "movie"
          : item.mediaType === "anime"
          ? "anime"
          : "series";
      const rawId = item.sourceId || item.id.split(":").pop() || item.id;

      return {
        url: `${siteUrl}/${type}/${rawId}`,
        lastModified: item.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...mediaRoutes];
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return staticRoutes;
  }
}
