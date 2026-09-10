import Link from "next/link";
import { Plus, Clock, Star, CheckCircle, Search, Film } from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { MediaCard } from "@/components/media/media-card";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { NormalizedMedia } from "@/lib/media/normalize";

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

  let logs: any[] = [];
  let stats = {
    total: 0,
    watching: 0,
    completed: 0,
    avgRating: 0,
    totalMinutes: 0,
  };

  if (user) {
    try {
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
      stats.watching = allUserLogs.filter((l) => l.log.status === "watching").length;
      stats.completed = allUserLogs.filter((l) => l.log.status === "completed").length;

      const rated = allUserLogs.filter((l) => l.log.rating !== null);
      if (rated.length > 0) {
        stats.avgRating =
          rated.reduce((acc, curr) => acc + Number(curr.log.rating), 0) / rated.length;
      }

      stats.totalMinutes = allUserLogs.reduce((acc, curr) => {
        const runtime = curr.media.runtime || 90;
        const eps = curr.log.episodesWatched || 1;
        return acc + runtime * eps;
      }, 0);

      // Filter by status & type
      logs = allUserLogs.filter((item) => {
        if (status !== "all" && item.log.status !== status) return false;
        if (type !== "all" && item.media.mediaType !== type) return false;
        return true;
      });
    } catch (err) {
      console.error("Library query error:", err);
    }
  }

  // Demo items for guests or empty states to match mockup experience
  const demoLibraryItems = [
    {
      media: {
        id: "tmdb:tv:95396",
        source: "tmdb" as const,
        sourceId: "95396",
        mediaType: "series" as const,
        title: "Severance",
        posterPath: "https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg",
        year: "2022",
        rating: 8.7,
        totalEpisodes: 10,
        genres: ["Sci-Fi", "Mystery"],
      },
      status: "watching" as const,
      userRating: 8.7,
      userEpisodes: 4,
    },
    {
      media: {
        id: "tmdb:movie:693134",
        source: "tmdb" as const,
        sourceId: "693134",
        mediaType: "movie" as const,
        title: "Dune: Part Two",
        posterPath: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
        year: "2024",
        rating: 9.2,
        totalEpisodes: 1,
        genres: ["Sci-Fi"],
      },
      status: "completed" as const,
      userRating: 9.2,
    },
    {
      media: {
        id: "anilist:127230",
        source: "anilist" as const,
        sourceId: "127230",
        mediaType: "anime" as const,
        title: "Cyberpunk: Edgerunners",
        posterPath: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-eU0Hq3sJ8o5l.jpg",
        year: "2022",
        rating: 8.9,
        totalEpisodes: 10,
        genres: ["Action", "Sci-Fi"],
      },
      status: "completed" as const,
      userRating: 8.9,
      userEpisodes: 10,
    },
    {
      media: {
        id: "tmdb:tv:76331",
        source: "tmdb" as const,
        sourceId: "76331",
        mediaType: "series" as const,
        title: "Succession",
        posterPath: "https://image.tmdb.org/t/p/w500/7udWfh98n7G2EebF8FvU3oMh1bW.jpg",
        year: "2023",
        rating: 9.4,
        totalEpisodes: 39,
        genres: ["Drama"],
      },
      status: "completed" as const,
      userRating: 9.4,
      userEpisodes: 39,
    },
    {
      media: {
        id: "tmdb:tv:126308",
        source: "tmdb" as const,
        sourceId: "126308",
        mediaType: "series" as const,
        title: "Shōgun",
        posterPath: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg",
        year: "2024",
        rating: 9.1,
        totalEpisodes: 10,
        genres: ["Drama", "History"],
      },
      status: "watching" as const,
      userRating: 9.1,
      userEpisodes: 7,
    },
    {
      media: {
        id: "tmdb:movie:872585",
        source: "tmdb" as const,
        sourceId: "872585",
        mediaType: "movie" as const,
        title: "Oppenheimer",
        posterPath: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        year: "2023",
        rating: 9.0,
        totalEpisodes: 1,
        genres: ["Drama", "History"],
      },
      status: "completed" as const,
      userRating: 9.0,
    },
  ];

  const days = Math.floor(stats.totalMinutes / (60 * 24));
  const hours = Math.floor((stats.totalMinutes % (60 * 24)) / 60);

  const activeItems = logs.length > 0 ? logs : demoLibraryItems;

  const statusTabs = [
    { id: "all", label: `All (${user ? stats.total : 142})` },
    { id: "watching", label: `Watching (${user ? stats.watching : 8})` },
    { id: "completed", label: `Completed (${user ? stats.completed : 94})` },
    { id: "plan_to_watch", label: "Plan to Watch" },
    { id: "on_hold", label: "On Hold" },
    { id: "dropped", label: "Dropped" },
  ];

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-12">
      <AppHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-20 flex flex-col gap-5">
        {/* Title Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="font-extrabold text-2xl sm:text-3xl text-[#F5F7FA] tracking-tight">
              My Library
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#151C27] border border-white/[0.06] text-[#A8B0BD]">
              {user ? `${stats.total} Titles Tracked` : "142 Titles Tracked"}
            </span>
          </div>

          <Link
            href="/search"
            className="px-3.5 py-2 rounded-lg bg-[#3B9EFF] text-xs font-semibold text-white hover:bg-[#5AAFFF] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Entry</span>
          </Link>
        </div>

        {/* Statistics Pills */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-[#151C27] border border-white/[0.06] flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[#3B9EFF] text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{user ? `${days}d ${hours}h` : "18d 4h"}</span>
            </div>
            <span className="text-[10px] text-[#A8B0BD] uppercase tracking-wider font-semibold mt-0.5">
              Watch Time
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#151C27] border border-white/[0.06] flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[#F5C84B] text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-[#F5C84B]" />
              <span>{user && stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "8.2"}</span>
            </div>
            <span className="text-[10px] text-[#A8B0BD] uppercase tracking-wider font-semibold mt-0.5">
              Avg Rating
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#151C27] border border-white/[0.06] flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[#22C55E] text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>
                {user && stats.total > 0
                  ? `${Math.round((stats.completed / stats.total) * 100)}%`
                  : "78%"}
              </span>
            </div>
            <span className="text-[10px] text-[#A8B0BD] uppercase tracking-wider font-semibold mt-0.5">
              Completed
            </span>
          </div>
        </div>

        {/* Status Horizontal Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {statusTabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/library?status=${tab.id}&type=${type}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                status === tab.id
                  ? "bg-[#3B9EFF] text-white shadow-sm"
                  : "bg-[#151C27] text-[#A8B0BD] hover:text-white border border-white/[0.04]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6F7886] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search within library..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#151C27] border border-white/[0.06] text-xs text-[#F5F7FA] placeholder-[#6F7886] focus:outline-none focus:border-[#3B9EFF]"
            />
          </div>

          {["all", "movie", "series", "anime"].map((t) => (
            <Link
              key={t}
              href={`/library?status=${status}&type=${t}`}
              className={`px-3 py-2 rounded-lg border capitalize whitespace-nowrap transition-colors ${
                type === t
                  ? "bg-[#3B9EFF]/20 border-[#3B9EFF] text-[#3B9EFF]"
                  : "bg-[#151C27] border-white/[0.06] text-[#A8B0BD] hover:text-white"
              }`}
            >
              {t === "all" ? "All Types" : t}
            </Link>
          ))}
        </div>

        {/* 2-Column Mobile Poster Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 mt-2">
          {activeItems.map((item: any) => {
            const media = item.media as NormalizedMedia;
            const logStatus = item.log ? item.log.status : item.status;
            const userRate = item.log?.rating ? Number(item.log.rating) : item.userRating;
            const eps = item.log ? item.log.episodesWatched : item.userEpisodes;

            return (
              <MediaCard
                key={media.id}
                media={media}
                status={logStatus}
                userRating={userRate}
                userEpisodes={eps}
              />
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
