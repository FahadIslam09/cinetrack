import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
import { LibraryView, LibraryItem } from "@/components/library/library-view";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { parseRating } from "@/lib/rating";
import { redirect } from "next/navigation";

interface LibraryPageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
  }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { status = "all", type = "all" } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/library");
  }

  let userProfile: any = null;
  let items: LibraryItem[] = [];
  let stats = {
    total: 0,
    movies: 0,
    series: 0,
    anime: 0,
    watching: 0,
    completed: 0,
    totalMinutes: 0,
  };

  if (user) {
    try {
      // 1. Fetch user profile
      const profileRows = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1);

      if (profileRows.length > 0) {
        userProfile = profileRows[0];
      }

      // 2. Fetch user media logs
      const allUserLogs = await db
        .select({
          log: userMediaLogs,
          media: mediaItems,
        })
        .from(userMediaLogs)
        .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
        .where(eq(userMediaLogs.userId, user.id))
        .orderBy(desc(userMediaLogs.updatedAt));

      stats.total = allUserLogs.length;
      stats.movies = allUserLogs.filter((l) => l.media.mediaType === "movie").length;
      stats.series = allUserLogs.filter((l) => l.media.mediaType === "series").length;
      stats.anime = allUserLogs.filter((l) => l.media.mediaType === "anime").length;
      stats.watching = allUserLogs.filter((l) => l.log.status === "watching").length;
      stats.completed = allUserLogs.filter((l) => l.log.status === "completed").length;

      stats.totalMinutes = allUserLogs.reduce((acc, curr) => {
        const fallback =
          curr.media.mediaType === "movie"
            ? 105
            : curr.media.mediaType === "anime"
            ? 24
            : 45;
        const runtime = curr.media.runtime || fallback;
        const eps =
          curr.media.mediaType === "movie"
            ? curr.log.status === "completed" || curr.log.status === "watching"
              ? 1
              : 0
            : curr.log.episodesWatched || (curr.log.status === "completed" ? curr.media.totalEpisodes || 1 : 0);
        return acc + runtime * eps;
      }, 0);

      items = allUserLogs.map((l) => ({
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
          year: l.media.releaseDate ? l.media.releaseDate.substring(0, 4) : undefined,
          rating: l.media.rating ? Number(l.media.rating) : 0,
          totalEpisodes: l.media.totalEpisodes || 1,
          genres: l.media.genres || [],
          synopsis: l.media.synopsis || undefined,
        },
        status: l.log.status as any,
        userRating: parseRating(l.log.rating),
        userEpisodes: l.log.episodesWatched,
        currentSeason: l.log.currentSeason ?? 1,
        currentEpisode: l.log.currentEpisode ?? 1,
        reviewText: l.log.reviewText,
        containsSpoilers: Boolean(l.log.containsSpoilers),
        updatedAt: l.log.updatedAt ? l.log.updatedAt.toISOString() : undefined,
      })).sort((a, b) => {
        const isWatchingA = a.status === "watching" ? 1 : 0;
        const isWatchingB = b.status === "watching" ? 1 : 0;
        if (isWatchingA !== isWatchingB) return isWatchingB - isWatchingA;
        return (
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
        );
      });
    } catch (err) {
      console.error("Library query error:", err);
    }
  }

  const finalItems = items;
  const finalStats = stats;

  const userProp = user
    ? {
        id: user.id,
        username: userProfile?.username || user.email?.split("@")[0] || "user",
        displayName: userProfile?.fullName || user.user_metadata?.full_name || userProfile?.username || user.email?.split("@")[0] || "Film Explorer",
        fullName: userProfile?.fullName,
        email: user.email,
        avatarUrl: userProfile?.avatarUrl || user.user_metadata?.avatar_url,
        backdropUrl: userProfile?.backdropUrl,
        bio: userProfile?.bio,
        createdAt: userProfile?.createdAt,
      }
    : null;

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D]">
      <AppHeader user={userProp} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-12 pt-18 sm:pt-24 pb-24 md:pb-12">
        <LibraryView
          initialItems={finalItems}
          user={userProp}
          stats={finalStats}
          initialStatus={status}
          initialType={type}
        />
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
