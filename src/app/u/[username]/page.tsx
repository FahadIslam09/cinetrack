import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
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
  const decoded = decodeURIComponent(username).replace(/^@/, "");
  const title = `@${decoded}'s Library`;
  const description = `Explore movies, series, and anime tracked by @${decoded} on CineTrack.`;
  const url = `/u/${decoded}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} · CineTrack`,
      description,
      url,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · CineTrack`,
      description,
    },
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

  // If user is suspended and caller is not owner/admin, hide profile
  if (targetProfile && targetProfile.status === "suspended" && !isOwner) {
    notFound();
  }

  const isPrivate = Boolean(targetProfile && !targetProfile.isPublic && !isOwner);

  if (targetProfile && !isPrivate) {
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
        displayName: targetProfile.fullName || targetProfile.username,
        fullName: targetProfile.fullName,
        email: null,
        avatarUrl: targetProfile.avatarUrl,
        backdropUrl: targetProfile.backdropUrl,
        bio: targetProfile.bio,
        createdAt: targetProfile.createdAt,
      }
    : {
        id: "demo-elenavance",
        username: "elenavance",
        displayName: "Elena Vance",
        fullName: "Elena Vance",
        email: null,
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop",
        backdropUrl: "https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
        bio: "Film archivist & sci-fi enthusiast. Contributor at Sight & Sound. Focused on post-Soviet speculative fiction and structuralist narratives.",
        createdAt: "2024-01-01",
      };

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D]">
      <AppHeader />

      <main className="flex-1 w-full max-w-[834px] lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-24 sm:pt-28 pb-24 md:pb-12">
        {isPrivate ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl bg-[#151C27] border border-white/[0.08] shadow-xl my-8 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#1D2734] border border-white/10 flex items-center justify-center text-[#A8B0BD] mb-4 shadow-inner">
              <Lock className="w-6 h-6 text-[#3B9EFF]" />
            </div>
            <h2 className="font-bold text-xl text-[#F5F7FA] tracking-tight">This Profile is Private</h2>
            <p className="text-xs sm:text-sm text-[#A8B0BD] mt-2 leading-relaxed max-w-sm">
              @{userProp.username} has set their library, watch activity, and statistics to private.
            </p>
          </div>
        ) : (
          <LibraryView
            initialItems={finalItems}
            user={userProp}
            stats={finalStats}
            initialStatus={status}
            initialType={type}
            isOwner={isOwner}
          />
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
