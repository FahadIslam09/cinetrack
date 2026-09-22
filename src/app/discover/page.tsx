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

  // 2. Query all mediaItems across the platform and all community user logs
  let allUniqueItems: LibraryItem[] = [];

  try {
    const [allMedia, allDbLogs] = await Promise.all([
      db.select().from(mediaItems).orderBy(desc(mediaItems.createdAt)),
      db
        .select({
          log: userMediaLogs,
          profile: {
            username: profiles.username,
            fullName: profiles.fullName,
          },
        })
        .from(userMediaLogs)
        .leftJoin(profiles, eq(userMediaLogs.userId, profiles.id))
        .orderBy(desc(userMediaLogs.updatedAt)),
    ]);

    // Group community logs by mediaId
    const logsByMediaId = new Map<string, typeof allDbLogs>();
    for (const l of allDbLogs) {
      const list = logsByMediaId.get(l.log.mediaId) || [];
      list.push(l);
      logsByMediaId.set(l.log.mediaId, list);
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

    if (allMedia && allMedia.length > 0) {
      allUniqueItems = allMedia.map((m) => {
        const mediaLogs = logsByMediaId.get(m.id) || [];
        const ratings = mediaLogs
          .map((l) => parseRating(l.log.rating))
          .filter(Boolean) as string[];
        const consensusRating = ratings.length > 0 ? getConsensusRating(ratings) : null;
        const bestLogWithReview = mediaLogs.find((l) => l.log.reviewText) || mediaLogs[0];
        const myLog = currentUserLogsMap.get(m.id);

        return {
          id: bestLogWithReview?.log.id || `media_${m.id}`,
          media: {
            id: m.id,
            source: m.source as "tmdb" | "anilist",
            sourceId: m.sourceId,
            mediaType: m.mediaType as "movie" | "series" | "anime",
            title: m.title,
            originalTitle: m.originalTitle || undefined,
            posterPath: m.posterPath || null,
            backdropPath: m.backdropPath || null,
            releaseDate: m.releaseDate || undefined,
            year: m.releaseDate ? m.releaseDate.substring(0, 4) : undefined,
            rating: m.rating ? Number(m.rating) : 0,
            totalEpisodes: m.totalEpisodes || 1,
            runtime: m.runtime || undefined,
            genres: m.genres || [],
            synopsis: m.synopsis || undefined,
            streamingProviders: (m.streamingProviders as any) || {},
          },
          status: myLog ? (myLog.status as any) : undefined,
          userRating: consensusRating,
          userEpisodes: myLog ? myLog.episodesWatched ?? undefined : undefined,
          currentSeason: myLog ? myLog.currentSeason ?? 1 : undefined,
          currentEpisode: myLog ? myLog.currentEpisode ?? 1 : undefined,
          reviewText: myLog?.reviewText || undefined,
          containsSpoilers: Boolean(myLog?.containsSpoilers),
          fromUsername: bestLogWithReview?.profile?.username || undefined,
          updatedAt: bestLogWithReview?.log.updatedAt
            ? bestLogWithReview.log.updatedAt.toISOString()
            : undefined,
        };
      });
    }
  } catch (err) {
    console.error("Discover DB query error:", err);
  }

  // Fallback to community curated items if DB has no media yet
  if (allUniqueItems.length === 0) {
    allUniqueItems = demoLibraryItems;
  }

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

