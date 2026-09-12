import Link from "next/link";
import {
  Compass,
  Crown,
  CheckCircle2,
  Award,
  Flame,
  Clock,
} from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { MediaCard } from "@/components/media/media-card";
import { DiscoverFilterBar } from "@/components/discover/discover-filter-bar";
import { LibraryItem } from "@/components/library/library-view";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { parseRating, getRatingRank, getConsensusRating } from "@/lib/rating";
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
                (pLower === "disney" && prov.provider_name?.toLowerCase().includes("disney"))
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
      return false;
    });
  }

  if (rating && rating !== "all") {
    filteredItems = filteredItems.filter(
      (i) => String(i.userRating || "").toLowerCase() === rating.toLowerCase()
    );
  }

  // 5. Categorize based on community ratings
  const ratingCategories = [
    {
      id: "masterpiece",
      title: "Masterpieces",
      label: "Masterpiece",
      description: "Highest rated by users on the platform",
      icon: <Crown className="w-4 h-4 text-[#F5C84B]" />,
      pillClass: "bg-[#F5C84B]/15 text-[#F5C84B] border-[#F5C84B]/30",
      dotClass: "bg-[#F5C84B]",
      items: filteredItems.filter((i) => i.userRating === "masterpiece"),
    },
    {
      id: "good",
      title: "Good",
      label: "Good",
      description: "Consistently recommended and praised",
      icon: <CheckCircle2 className="w-4 h-4 text-[#3B9EFF]" />,
      pillClass: "bg-[#3B9EFF]/15 text-[#3B9EFF] border-[#3B9EFF]/30",
      dotClass: "bg-[#3B9EFF]",
      items: filteredItems.filter((i) => i.userRating === "good"),
    },
    {
      id: "average",
      title: "Average",
      label: "Average",
      description: "Solid entertainment with mixed community reception",
      icon: <Award className="w-4 h-4 text-[#F59E0B]" />,
      pillClass: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
      dotClass: "bg-[#F59E0B]",
      items: filteredItems.filter((i) => i.userRating === "average"),
    },
    {
      id: "poor",
      title: "Poor",
      label: "Poor",
      description: "Disappointing or dropped titles",
      icon: <Flame className="w-4 h-4 text-[#F43F5E]" />,
      pillClass: "bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/30",
      dotClass: "bg-[#F43F5E]",
      items: filteredItems.filter((i) => i.userRating === "poor"),
    },
  ];

  // If unrated items exist and user hasn't filtered to a specific rating:
  const unratedItems = filteredItems.filter((i) => !i.userRating);
  if (unratedItems.length > 0 && (!rating || rating === "all")) {
    ratingCategories.push({
      id: "unrated",
      title: "Community Tracked",
      label: "Unrated",
      description: "Recently added titles pending user rating",
      icon: <Clock className="w-4 h-4 text-[#A8B0BD]" />,
      pillClass: "bg-white/[0.06] text-[#A8B0BD] border-white/[0.1]",
      dotClass: "bg-[#A8B0BD]",
      items: unratedItems,
    });
  }

  // Only display categories that contain matching items
  const activeCategories = ratingCategories.filter((cat) => cat.items.length > 0);

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

        {/* Single Row Dropdown Filter Bar */}
        <div className="relative z-30">
          <DiscoverFilterBar
            currentType={type}
            currentProvider={provider}
            currentGenre={genre}
            currentRating={rating}
            totalResults={filteredItems.length}
          />
        </div>

        {/* Results Categorized by Ratings (or Empty State) */}
        {activeCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-[#151C27]/40 border border-white/[0.04] mt-2">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#6F7886] mb-3.5">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#F5F7FA]">No titles match your filters</h3>
            <p className="text-xs text-[#A8B0BD] max-w-xs sm:max-w-sm mt-1 leading-relaxed">
              No user-added titles match the selected format, platform, genre, or rating.
            </p>
            <Link
              href="/discover"
              className="mt-5 px-4 py-2 rounded-xl bg-[#3B9EFF] hover:bg-[#2F8EEA] text-white text-xs font-semibold transition-all shadow-md shadow-[#3B9EFF]/20"
            >
              Reset all filters
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-9 mt-1">
            {activeCategories.map((cat) => (
              <section key={cat.id} className="flex flex-col gap-3.5">
                {/* Rating Category Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${cat.pillClass}`}
                    >
                      {cat.icon}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-[#F5F7FA] tracking-tight">
                          {cat.title}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.pillClass}`}
                        >
                          {cat.items.length}
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs text-[#A8B0BD]">
                        {cat.description}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Media Cards Grid - Same design as library page */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
                  {cat.items.map((item) => (
                    <MediaCard
                      key={item.id}
                      media={item.media}
                      status={item.status}
                      userRating={item.userRating || undefined}
                      userEpisodes={item.userEpisodes}
                      currentSeason={item.currentSeason}
                      currentEpisode={item.currentEpisode}
                      seasons={item.seasons}
                      reviewText={item.reviewText}
                      containsSpoilers={item.containsSpoilers}
                      readOnly={true}
                      className="w-full"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
