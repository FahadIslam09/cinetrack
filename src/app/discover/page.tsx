import type { Metadata } from "next";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
import { DiscoverView } from "@/components/discover/discover-view";
import { LibraryItem } from "@/components/library/library-view";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { parseRating, getConsensusRating } from "@/lib/rating";
import { demoLibraryItems } from "@/lib/demo-library";

export const metadata: Metadata = {
  title: "Discover Movies, Series & Anime",
  description:
    "Explore top-rated movies, trending television series, and popular anime with streaming availability and community consensus ratings.",
  alternates: {
    canonical: "/discover",
  },
  openGraph: {
    title: "Discover Movies, Series & Anime · CineTrack",
    description:
      "Explore top-rated movies, trending television series, and popular anime with streaming availability and community consensus ratings.",
    url: "/discover",
  },
};

interface DiscoverPageProps {
  searchParams: Promise<{
    type?: string;
    genre?: string;
    provider?: string;
    rating?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const {
    type = "all",
    genre = "all",
    provider = "all",
    rating = "all",
  } = await searchParams;

  // 1. Current Auth User (for AppHeader avatar/profile)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile: any = null;
  if (user) {
    try {
      const profileRows = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1);
      if (profileRows.length > 0) {
        userProfile = profileRows[0];
      }
    } catch {
      // ignore
    }
  }

  const userProp = user
    ? {
        id: user.id,
        username: userProfile?.username || user.email?.split("@")[0] || "user",
        displayName:
          userProfile?.fullName ||
          user.user_metadata?.full_name ||
          userProfile?.username ||
          user.email?.split("@")[0] ||
          "Film Explorer",
        fullName: userProfile?.fullName,
        email: user.email,
        avatarUrl: userProfile?.avatarUrl || user.user_metadata?.avatar_url,
        backdropUrl: userProfile?.backdropUrl,
        bio: userProfile?.bio,
        createdAt: userProfile?.createdAt,
      }
    : null;

  // 2. Query all media added/tracked by users across the platform
  let allItems: LibraryItem[] = [];

  try {
    const dbLogs = await db
      .select({
        log: userMediaLogs,
        media: mediaItems,
        profile: {
          username: profiles.username,
          fullName: profiles.fullName,
        },
      })
      .from(userMediaLogs)
      .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
      .leftJoin(profiles, eq(userMediaLogs.userId, profiles.id))
      .orderBy(desc(userMediaLogs.updatedAt))
      .limit(200);

    if (dbLogs && dbLogs.length > 0) {
      allItems = dbLogs.map((l) => ({
        id: l.log.id,
        media: {
          id: l.media.id,
          source: l.media.source as "tmdb" | "anilist",
          sourceId: l.media.sourceId,
          mediaType: l.media.mediaType as "movie" | "series" | "anime",
          title: l.media.title,
          originalTitle: l.media.originalTitle || undefined,
          posterPath: l.media.posterPath || null,
          backdropPath: l.media.backdropPath || null,
          releaseDate: l.media.releaseDate || undefined,
          year: l.media.releaseDate ? l.media.releaseDate.substring(0, 4) : undefined,
          rating: l.media.rating ? Number(l.media.rating) : 0,
          totalEpisodes: l.media.totalEpisodes || 1,
          runtime: l.media.runtime || undefined,
          genres: l.media.genres || [],
          synopsis: l.media.synopsis || undefined,
          streamingProviders: (l.media.streamingProviders as any) || {},
        },
        status: l.log.status as any,
        userRating: parseRating(l.log.rating),
        userEpisodes: l.log.episodesWatched,
        currentSeason: l.log.currentSeason ?? 1,
        currentEpisode: l.log.currentEpisode ?? 1,
        reviewText: l.log.reviewText,
        containsSpoilers: Boolean(l.log.containsSpoilers),
        fromUsername: l.profile?.username || undefined,
        updatedAt: l.log.updatedAt ? l.log.updatedAt.toISOString() : undefined,
      }));
    }
  } catch (err) {
    console.error("Discover DB query error:", err);
  }

  // Fallback to community curated items if DB has no logged items yet
  if (allItems.length === 0) {
    allItems = demoLibraryItems;
  }

  // 3. Query current authenticated user's library logs (if signed in)
  const currentUserLogsMap = new Map<string, typeof userMediaLogs.$inferSelect>();
  if (user) {
    try {
      const myLogs = await db
        .select()
        .from(userMediaLogs)
        .where(eq(userMediaLogs.userId, user.id));

      for (const ml of myLogs) {
        currentUserLogsMap.set(ml.mediaId, ml);
      }
    } catch (e) {
      console.error("Discover user logs query error:", e);
    }
  }

  // 4. Collect all user ratings per media item to determine platform consensus rating
  const ratingsByMediaId = new Map<string, string[]>();
  for (const item of allItems) {
    if (item.userRating) {
      const list = ratingsByMediaId.get(item.media.id) || [];
      list.push(String(item.userRating));
      ratingsByMediaId.set(item.media.id, list);
    }
  }

  // Deduplicate by media.id to showcase distinct titles
  const mediaMap = new Map<string, LibraryItem>();
  for (const item of allItems) {
    const existing = mediaMap.get(item.media.id);
    if (!existing) {
      mediaMap.set(item.media.id, { ...item });
    } else if (!existing.reviewText && item.reviewText) {
      mediaMap.set(item.media.id, { ...item });
    }
  }

  // Apply consensus rating across all users for category grouping,
  // but bind personal status and watch progress ONLY if present in the viewer's library.
  for (const [mediaId, item] of mediaMap.entries()) {
    const ratings = ratingsByMediaId.get(mediaId);
    if (ratings && ratings.length > 0) {
      item.userRating = getConsensusRating(ratings);
    }

    const myLog = currentUserLogsMap.get(mediaId);
    if (myLog) {
      item.status = myLog.status as any;
      item.userEpisodes = myLog.episodesWatched ?? undefined;
      item.currentSeason = myLog.currentSeason ?? 1;
      item.currentEpisode = myLog.currentEpisode ?? 1;
      item.reviewText = myLog.reviewText || undefined;
      item.containsSpoilers = Boolean(myLog.containsSpoilers);
    } else {
      item.status = undefined;
      item.userEpisodes = undefined;
      item.currentSeason = undefined;
      item.currentEpisode = undefined;
      item.reviewText = undefined;
      item.containsSpoilers = false;
    }
  }
  const allUniqueItems = Array.from(mediaMap.values());

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D]">
      <AppHeader user={userProp} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-3.5 sm:px-6 lg:px-12 pt-18 sm:pt-24 pb-24 md:pb-12 flex flex-col gap-4 sm:gap-6">
        {/* Header Title & Subtitle */}
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <h1 className="font-black text-xl sm:text-3xl lg:text-4xl text-[#F5F7FA] tracking-tight">
            Discover
          </h1>
          <p className="text-xs sm:text-sm text-[#8E97A6] max-w-xl leading-relaxed">
            Explore movies, TV series, and anime added by users across CineTrack, categorized by rating.
          </p>
        </div>

        <DiscoverView
          items={allUniqueItems}
          initialType={type}
          initialProvider={provider}
          initialGenre={genre}
          initialRating={rating}
        />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

