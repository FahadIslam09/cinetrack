import Link from "next/link";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { MediaCard } from "@/components/media/media-card";
import { tmdb } from "@/lib/tmdb/client";
import { anilist } from "@/lib/anilist/client";
import {
  normalizeTmdbMovie,
  normalizeTmdbTV,
  normalizeAniListAnime,
  NormalizedMedia,
} from "@/lib/media/normalize";

interface DiscoverPageProps {
  searchParams: Promise<{
    type?: string;
    genre?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { type = "all", genre } = await searchParams;

  let items: NormalizedMedia[] = [];

  try {
    if (type === "movie") {
      const res = await tmdb.discoverMovies();
      items = res.results.map(normalizeTmdbMovie);
    } else if (type === "series") {
      const res = await tmdb.discoverTV();
      items = res.results.map(normalizeTmdbTV);
    } else if (type === "anime") {
      const res = await anilist.getTrendingAnime(20);
      items = res.map(normalizeAniListAnime);
    } else {
      // "all"
      const [movies, anime] = await Promise.all([
        tmdb.getPopularMovies().catch(() => ({ results: [] })),
        anilist.getTrendingAnime(10).catch(() => []),
      ]);

      const normMovies = movies.results.slice(0, 10).map(normalizeTmdbMovie);
      const normAnime = anime.map(normalizeAniListAnime);
      items = [...normMovies, ...normAnime];
    }

    if (genre) {
      items = items.filter((item) =>
        item.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase()))
      );
    }
  } catch (err) {
    console.error("Discover page error:", err);
  }

  const ottProviders = [
    { name: "Netflix", logo: "https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
    { name: "Prime Video", logo: "https://image.tmdb.org/t/p/w92/mxeBtA4jdwqV738A5M09j96s4f3.jpg" },
    { name: "Disney+", logo: "https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg" },
    { name: "Apple TV+", logo: "https://image.tmdb.org/t/p/w92/2E03HGHYNvTzsgL82EBZh3NZUBD.jpg" },
    { name: "Crunchyroll", logo: "https://image.tmdb.org/t/p/w92/8N0DNa4miA2WTY5Kk2t1qF3p9u.jpg" },
    { name: "Max", logo: "https://image.tmdb.org/t/p/w92/fksCUZ9QDWZMUwL2Lgq5M6o0W4z.jpg" },
    { name: "Hoichoi", logo: "https://image.tmdb.org/t/p/w92/uG2w6bYy6v64p1w0A5W2gM0m3k.jpg" },
  ];

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-12">
      <AppHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-20 flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-extrabold text-2xl sm:text-3xl text-[#F5F7FA] tracking-tight">
            Discover
          </h1>
          <p className="text-xs sm:text-sm text-[#A8B0BD]">
            Explore global movies, TV shows, and anime curated by popularity and streaming platform.
          </p>
        </div>

        {/* Media Type Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "all", label: "All Media", href: "/discover" },
            { id: "movie", label: "Movies", href: "/discover?type=movie" },
            { id: "series", label: "TV Shows", href: "/discover?type=series" },
            { id: "anime", label: "Anime", href: "/discover?type=anime" },
          ].map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                type === tab.id
                  ? "bg-[#3B9EFF] text-white shadow-sm"
                  : "bg-[#151C27] text-[#A8B0BD] hover:text-white border border-white/[0.04]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Geo-Aware Streaming Provider Filter Chips */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[#A8B0BD] uppercase tracking-wider">
            Streaming On (Global / Regional)
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {ottProviders.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151C27] border border-white/[0.06] shrink-0 text-xs font-medium text-[#F5F7FA] hover:border-[#3B9EFF] cursor-pointer transition-colors"
              >
                <img
                  src={p.logo}
                  alt={p.name}
                  className="w-5 h-5 rounded object-cover"
                />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Tags */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          {["Action", "Sci-Fi", "Drama", "Thriller", "Comedy", "Fantasy", "Horror", "Animation"].map(
            (g) => (
              <Link
                key={g}
                href={`/discover?type=${type}&genre=${encodeURIComponent(g)}`}
                className={`px-3 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                  genre?.toLowerCase() === g.toLowerCase()
                    ? "bg-[#3B9EFF]/20 border-[#3B9EFF] text-[#3B9EFF]"
                    : "bg-[#1D2734] border-white/[0.06] text-[#A8B0BD] hover:text-white"
                }`}
              >
                {g}
              </Link>
            )
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 mt-2">
          {items.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
