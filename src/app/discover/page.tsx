import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { DiscoverView } from "@/components/discover/discover-view";
import { LibraryItem } from "@/components/library/library-view";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { parseRating, getConsensusRating } from "@/lib/rating";
import { demoLibraryItems } from "@/lib/demo-library";

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
      .orderBy(desc(userMediaLogs.updatedAt));

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
          rating: 8.0,
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

  // 3. Collect all user ratings per media item to determine platform consensus rating
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

  // Apply consensus rating across all users for each title on Discover
  for (const [mediaId, item] of mediaMap.entries()) {
    const ratings = ratingsByMediaId.get(mediaId);
    if (ratings && ratings.length > 0) {
      item.userRating = getConsensusRating(ratings);
    }
  }
  let filteredItems = Array.from(mediaMap.values());

  // 4. Apply Filters: Media Type, Genre, Streaming Platform, Rating
  if (type && type !== "all") {
    filteredItems = filteredItems.filter((i) => i.media.mediaType === type);
  }

  if (genre && genre !== "all") {
    filteredItems = filteredItems.filter((i) =>
      i.media.genres?.some((g) => g.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  if (provider && provider !== "all") {
    const pLower = provider.toLowerCase();
    filteredItems = filteredItems.filter((item) => {
      const sp = item.media.streamingProviders;
      if (sp) {
        for (const region of Object.values(sp as Record<string, any>)) {
          const list = [
            ...(region?.flatrate || []),
            ...(region?.ads || []),
            ...(region?.buy || []),
            ...(region?.rent || []),
          ];
          if (
            list.some(
              (prov: any) =>
                prov.provider_name?.toLowerCase().includes(pLower) ||
                (pLower === "prime" && prov.provider_name?.toLowerCase().includes("amazon")) ||
                (pLower === "apple" && prov.provider_name?.toLowerCase().includes("apple")) ||
                (pLower === "disney" && prov.provider_name?.toLowerCase().includes("disney")) ||
                (pLower === "paramount" && prov.provider_name?.toLowerCase().includes("paramount")) ||
                (pLower === "peacock" && prov.provider_name?.toLowerCase().includes("peacock")) ||
                (pLower === "hulu" && prov.provider_name?.toLowerCase().includes("hulu")) ||
                (pLower === "jio" && (prov.provider_name?.toLowerCase().includes("jio") || prov.provider_name?.toLowerCase().includes("hotstar"))) ||
                (pLower === "zee5" && prov.provider_name?.toLowerCase().includes("zee")) ||
                (pLower === "sonyliv" && prov.provider_name?.toLowerCase().includes("sony")) ||
                (pLower === "hoichoi" && prov.provider_name?.toLowerCase().includes("hoichoi")) ||
                (pLower === "chorki" && prov.provider_name?.toLowerCase().includes("chorki"))
            )
          ) {
            return true;
          }
        }
      }
      // Heuristic fallback for demo and community titles
      const t = item.media.title.toLowerCase();
      if (pLower === "apple" && t.includes("severance")) return true;
      if (
        pLower === "crunchyroll" &&
        (item.media.mediaType === "anime" ||
          t.includes("frieren") ||
          t.includes("jujutsu") ||
          t.includes("titan") ||
          t.includes("chainsaw") ||
          t.includes("demon slayer"))
      )
        return true;
      if (pLower === "netflix" && (t.includes("stranger") || t.includes("squid") || t.includes("queen")))
        return true;
      if (pLower === "max" && (t.includes("dune") || t.includes("succession") || t.includes("game of thrones")))
        return true;
      if (pLower === "hulu" && (t.includes("bear") || t.includes("shogun") || t.includes("only murders")))
        return true;
      if (pLower === "paramount" && (t.includes("yellowstone") || t.includes("top gun") || t.includes("tulsa king")))
        return true;
      if (pLower === "peacock" && (t.includes("oppenheimer") || t.includes("poker face") || t.includes("office")))
        return true;
      if (pLower === "chorki" && (t.includes("myself allen") || t.includes("networker") || t.includes("redrum") || t.includes("guti") || t.includes("pet kata") || t.includes("unoloukik")))
        return true;
      return false;
    });
  }

  if (rating && rating !== "all") {
    filteredItems = filteredItems.filter(
      (i) => String(i.userRating || "").toLowerCase() === rating.toLowerCase()
    );
  }
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-12">
      <AppHeader user={userProp} />

      <main className="flex-1 max-w-[834px] lg:max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Header Title & Subtitle */}
        <div className="flex flex-col gap-1">
          <h1 className="font-black text-2xl sm:text-3xl lg:text-4xl text-[#F5F7FA] tracking-tight">
            Discover
          </h1>
          <p className="text-xs sm:text-sm text-[#8E97A6] max-w-xl leading-relaxed">
            Explore movies, TV series, and anime added by users across CineTrack, categorized by rating.
          </p>
        </div>

        <DiscoverView
          items={filteredItems}
          currentType={type}
          currentProvider={provider}
          currentGenre={genre}
          currentRating={rating}
        />
      </main>

      <BottomNav />
    </div>
  );
}

