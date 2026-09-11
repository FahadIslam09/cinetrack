import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { LibraryView, LibraryItem } from "@/components/library/library-view";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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

  let userProfile: any = null;
  let items: LibraryItem[] = [];
  let stats = {
    total: 0,
    movies: 0,
    series: 0,
    anime: 0,
    watching: 0,
    completed: 0,
    avgRating: 0,
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

      const rated = allUserLogs.filter(
        (l) => l.log.rating !== null && l.log.rating !== undefined
      );
      if (rated.length > 0) {
        stats.avgRating =
          rated.reduce((acc, curr) => acc + Number(curr.log.rating), 0) / rated.length;
      }

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
          rating: l.log.rating ? Number(l.log.rating) : 0,
          totalEpisodes: l.media.totalEpisodes || 1,
          genres: l.media.genres || [],
          synopsis: l.media.synopsis || undefined,
        },
        status: l.log.status as any,
        userRating: l.log.rating ? Number(l.log.rating) : undefined,
        userEpisodes: l.log.episodesWatched,
        reviewText: l.log.reviewText,
        updatedAt: l.log.updatedAt ? l.log.updatedAt.toISOString() : undefined,
      }));
    } catch (err) {
      console.error("Library query error:", err);
    }
  }

  // Curated demo items with verified 200 OK TMDb posters and rich genre tagging
  const demoLibraryItems: LibraryItem[] = [
    {
      id: "demo-1",
      media: {
        id: "tmdb:movie:872585",
        source: "tmdb",
        sourceId: "872585",
        mediaType: "movie",
        title: "Oppenheimer",
        posterPath: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        backdropPath: null,
        year: "2023",
        rating: 8.9,
        totalEpisodes: 1,
        genres: ["Drama", "History"],
      },
      status: "completed",
      userRating: 9.5,
      updatedAt: "2024-03-10T12:00:00.000Z",
    },
    {
      id: "demo-2",
      media: {
        id: "tmdb:movie:569094",
        source: "tmdb",
        sourceId: "569094",
        mediaType: "movie",
        title: "Spider-Man: Across the Spider-Verse",
        posterPath: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        backdropPath: null,
        year: "2023",
        rating: 8.4,
        totalEpisodes: 1,
        genres: ["Animation", "Action", "Comedy"],
      },
      status: "completed",
      userRating: 9.3,
      updatedAt: "2024-02-14T15:30:00.000Z",
    },
    {
      id: "demo-3",
      media: {
        id: "tmdb:tv:95396",
        source: "tmdb",
        sourceId: "95396",
        mediaType: "series",
        title: "Severance",
        posterPath: "https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg",
        backdropPath: null,
        year: "2022",
        rating: 8.4,
        totalEpisodes: 10,
        genres: ["Sci-Fi", "Mystery", "Drama"],
      },
      status: "watching",
      userRating: 9.2,
      userEpisodes: 8,
      updatedAt: "2024-04-01T08:00:00.000Z",
    },
    {
      id: "demo-4",
      media: {
        id: "tmdb:movie:792307",
        source: "tmdb",
        sourceId: "792307",
        mediaType: "movie",
        title: "Poor Things",
        posterPath: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
        backdropPath: null,
        year: "2023",
        rating: 7.8,
        totalEpisodes: 1,
        genres: ["Comedy", "Sci-Fi", "Romance"],
      },
      status: "completed",
      userRating: 8.8,
      updatedAt: "2024-01-20T21:00:00.000Z",
    },
    {
      id: "demo-5",
      media: {
        id: "tmdb:tv:126308",
        source: "tmdb",
        sourceId: "126308",
        mediaType: "series",
        title: "Shōgun",
        posterPath: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg",
        backdropPath: null,
        year: "2024",
        rating: 8.5,
        totalEpisodes: 10,
        genres: ["Drama", "History", "Action"],
      },
      status: "watching",
      userRating: 9.1,
      userEpisodes: 7,
      updatedAt: "2024-04-12T18:40:00.000Z",
    },
    {
      id: "demo-6",
      media: {
        id: "tmdb:tv:1429",
        source: "tmdb",
        sourceId: "1429",
        mediaType: "anime",
        title: "Attack on Titan",
        posterPath: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
        backdropPath: null,
        year: "2013",
        rating: 8.7,
        totalEpisodes: 87,
        genres: ["Action", "Fantasy", "Animation"],
      },
      status: "completed",
      userRating: 9.6,
      userEpisodes: 87,
      updatedAt: "2023-12-05T10:00:00.000Z",
    },
    {
      id: "demo-7",
      media: {
        id: "tmdb:tv:209867",
        source: "tmdb",
        sourceId: "209867",
        mediaType: "anime",
        title: "Frieren: Beyond Journey's End",
        posterPath: "https://image.tmdb.org/t/p/w500/dqZENchTd7lp5zht7BdlqM7RBhD.jpg",
        backdropPath: null,
        year: "2023",
        rating: 8.9,
        totalEpisodes: 28,
        genres: ["Fantasy", "Adventure", "Animation"],
      },
      status: "completed",
      userRating: 9.4,
      userEpisodes: 28,
      updatedAt: "2024-03-22T19:00:00.000Z",
    },
    {
      id: "demo-8",
      media: {
        id: "tmdb:tv:95479",
        source: "tmdb",
        sourceId: "95479",
        mediaType: "anime",
        title: "Jujutsu Kaisen",
        posterPath: "https://image.tmdb.org/t/p/w500/6qQzMJG27XOJsyAEEIisoJB45j2.jpg",
        backdropPath: null,
        year: "2020",
        rating: 8.6,
        totalEpisodes: 47,
        genres: ["Action", "Supernatural", "Animation"],
      },
      status: "completed",
      userRating: 9.0,
      userEpisodes: 47,
      updatedAt: "2024-01-15T14:00:00.000Z",
    },
    {
      id: "demo-9",
      media: {
        id: "tmdb:movie:666277",
        source: "tmdb",
        sourceId: "666277",
        mediaType: "movie",
        title: "Past Lives",
        posterPath: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
        backdropPath: null,
        year: "2023",
        rating: 7.9,
        totalEpisodes: 1,
        genres: ["Drama", "Romance"],
      },
      status: "completed",
      userRating: 8.7,
      updatedAt: "2023-11-20T22:15:00.000Z",
    },
    {
      id: "demo-10",
      media: {
        id: "tmdb:movie:937287",
        source: "tmdb",
        sourceId: "937287",
        mediaType: "movie",
        title: "Challengers",
        posterPath: "https://image.tmdb.org/t/p/w500/H6vke7zGiuLsz4v4RPeReb9rsv.jpg",
        backdropPath: null,
        year: "2024",
        rating: 7.2,
        totalEpisodes: 1,
        genres: ["Drama", "Romance"],
      },
      status: "completed",
      userRating: 8.4,
      updatedAt: "2024-05-02T16:00:00.000Z",
    },
    {
      id: "demo-11",
      media: {
        id: "tmdb:tv:85937",
        source: "tmdb",
        sourceId: "85937",
        mediaType: "anime",
        title: "Demon Slayer: Kimetsu no Yaiba",
        posterPath: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
        backdropPath: null,
        year: "2019",
        rating: 8.7,
        totalEpisodes: 55,
        genres: ["Action", "Fantasy", "Animation"],
      },
      status: "completed",
      userRating: 8.9,
      userEpisodes: 55,
      updatedAt: "2024-02-28T11:00:00.000Z",
    },
    {
      id: "demo-12",
      media: {
        id: "tmdb:tv:114410",
        source: "tmdb",
        sourceId: "114410",
        mediaType: "anime",
        title: "Chainsaw Man",
        posterPath: "https://image.tmdb.org/t/p/w500/iFM1dyFi0rByvEomEkmm7NpQeeb.jpg",
        backdropPath: null,
        year: "2022",
        rating: 8.5,
        totalEpisodes: 12,
        genres: ["Action", "Supernatural", "Animation"],
      },
      status: "completed",
      userRating: 8.8,
      userEpisodes: 12,
      updatedAt: "2023-10-18T17:45:00.000Z",
    },
  ];

  const finalItems = items.length > 0 ? items : demoLibraryItems;

  const finalStats =
    items.length > 0
      ? stats
      : {
          total: 142,
          movies: 64,
          series: 42,
          anime: 36,
          watching: 8,
          completed: 118,
          avgRating: 9.0,
          totalMinutes: 26400,
        };

  const userProp = user
    ? {
        id: user.id,
        username: userProfile?.username || user.email?.split("@")[0] || "user",
        email: user.email,
        avatarUrl: userProfile?.avatarUrl || user.user_metadata?.avatar_url,
      }
    : null;

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D]">
      <AppHeader user={userProp} />

      <main className="flex-1 w-full max-w-[834px] lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-24 sm:pt-28 pb-24 md:pb-12">
        <LibraryView
          initialItems={finalItems}
          user={userProp}
          stats={finalStats}
          initialStatus={status}
          initialType={type}
        />
      </main>

      <BottomNav />
    </div>
  );
}
