import { notFound } from "next/navigation";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { LibraryView, LibraryItem } from "@/components/library/library-view";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { parseRating } from "@/lib/rating";
import { demoStats, demoLibraryItems } from "@/lib/demo-library";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    status?: string;
    type?: string;
  }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  return {
    title: `@${decoded}'s Library — CineTrack`,
    description: `Explore movies, series, and anime tracked by @${decoded} on CineTrack.`,
  };
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { username } = await params;
  const { status = "all", type = "all" } = await searchParams;
  const normalizedUsername = decodeURIComponent(username).toLowerCase().replace(/^@/, "");

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  let targetProfile: any = null;
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

  try {
    const foundProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, normalizedUsername))
      .limit(1);

    if (foundProfiles.length > 0) {
      targetProfile = foundProfiles[0];
    }
  } catch (err) {
    console.error("Profile lookup error:", err);
  }

  // Fallback demo user for showcase/demo username
  const isDemo = !targetProfile && (normalizedUsername === "elenavance" || normalizedUsername === "demo");

  if (!targetProfile && !isDemo) {
    notFound();
  }

  const isOwner = Boolean(currentUser && targetProfile && currentUser.id === targetProfile.id);

  if (targetProfile) {
    try {
      const allUserLogs = await db
        .select({
          log: userMediaLogs,
          media: mediaItems,
        })
        .from(userMediaLogs)
        .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
        .where(eq(userMediaLogs.userId, targetProfile.id))
        .orderBy(desc(userMediaLogs.updatedAt));

      stats.total = allUserLogs.length;
      stats.movies = allUserLogs.filter((l) => l.media.mediaType === "movie").length;
      stats.series = allUserLogs.filter((l) => l.media.mediaType === "series").length;
      stats.anime = allUserLogs.filter((l) => l.media.mediaType === "anime").length;
      stats.watching = allUserLogs.filter((l) => l.log.status === "watching").length;
      stats.completed = allUserLogs.filter((l) => l.log.status === "completed").length;

      stats.totalMinutes = allUserLogs.reduce((acc, curr) => {
        const runtime = curr.media.runtime || 90;
        const eps = curr.log.episodesWatched || 1;
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
          rating: 8.0,
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
      }));
    } catch (err) {
      console.error("Error fetching media logs for profile:", err);
    }
  }

  const finalItems = items.length > 0 || !isDemo ? items : demoLibraryItems;
  const finalStats = items.length > 0 || !isDemo ? stats : demoStats;

  const userProp = targetProfile
    ? {
        id: targetProfile.id,
        username: targetProfile.username,
        email: null,
        avatarUrl: targetProfile.avatarUrl,
      }
    : {
        id: "demo-elenavance",
        username: "elenavance",
        email: null,
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop",
      };

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D]">
      <AppHeader />

      <main className="flex-1 w-full max-w-[834px] lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-24 sm:pt-28 pb-24 md:pb-12">
        <LibraryView
          initialItems={finalItems}
          user={userProp}
          stats={finalStats}
          initialStatus={status}
          initialType={type}
          isOwner={isOwner}
        />
      </main>

      <BottomNav />
    </div>
  );
}
