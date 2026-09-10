"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Star,
  Compass,
  Share2,
  ArrowRight,
  Play,
  BookmarkCheck,
  Sparkles,
} from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";

interface HeroBannerProps {
  user?: {
    username?: string;
    email?: string;
  } | null;
  featuredMovie?: NormalizedMedia | null;
  featuredTV?: {
    title: string;
    posterPath: string;
    backdropPath?: string;
    currentEpisode?: number;
    totalEpisodes?: number;
  };
  featuredAnime?: {
    title: string;
    posterPath: string;
    rating?: number;
  };
}

export function HeroBanner({
  user,
  featuredMovie,
  featuredTV,
  featuredAnime,
}: HeroBannerProps) {
  const isLoggedIn = !!user;
  const username = user?.username || user?.email?.split("@")[0] || "Cinephile";

  // Fallbacks for media artwork ecosystem
  const movie = featuredMovie || {
    id: "tmdb:movie:693134",
    title: "Dune: Part Two",
    year: "2024",
    rating: 8.8,
    posterPath: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
    mediaType: "movie",
    sourceId: "693134",
  };

  const tv = featuredTV || {
    title: "Severance",
    posterPath: "https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w780/ixgFmf1X59PUZam2qbAfskx2gQr.jpg",
    currentEpisode: 4,
    totalEpisodes: 10,
  };

  const anime = featuredAnime || {
    title: "Frieren: Beyond Journey's End",
    posterPath: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-gviZ2zfLIf0w.jpg",
    rating: 9.4,
  };

  return (
    <section className="relative w-full bg-[#0F141D] overflow-hidden border-b border-white/[0.06] pt-6 pb-10 sm:py-12 md:py-16">
      {/* Background Soft Atmospheric Ambient Glow */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#3B9EFF]/10 rounded-full blur-[140px] pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#F5C84B]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Product Value Proposition & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Level 1: Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B9EFF] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#A8B0BD]">
                {isLoggedIn ? "YOUR PERSONAL DASHBOARD" : "YOUR PERSONAL MEDIA LIBRARY"}
              </span>
            </div>

            {/* Level 2: Main Heading (The Visual Anchor) */}
            <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[52px] tracking-tight text-[#F5F7FA] leading-[1.12] mb-4">
              {isLoggedIn ? (
                <>
                  Welcome back, <br className="hidden sm:inline" />
                  <span className="text-[#3B9EFF]">{username}.</span>
                </>
              ) : (
                <>
                  Everything You Watch, <br className="hidden sm:inline" />
                  In One Place.
                </>
              )}
            </h1>

            {/* Level 3: Supporting Description */}
            <p className="text-sm sm:text-base text-[#A8B0BD] leading-relaxed max-w-xl mb-6 sm:mb-8">
              {isLoggedIn
                ? "Pick up right where you left off across your active watchlists, log new ratings, or discover your next cinematic obsession."
                : "Track movies, TV shows, and anime. Rate what you watch, write reviews, discover what to watch next, and build your own cinematic profile."}
            </p>

            {/* Level 4: CTAs (Primary & Secondary) */}
            <div className="flex items-center flex-wrap gap-3 sm:gap-4 w-full sm:w-auto mb-8">
              {isLoggedIn ? (
                <Link
                  href="/library"
                  className="h-12 px-6 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#3B9EFF]/20 active:scale-95 transition-all"
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Open Your Library</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="h-12 px-7 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#3B9EFF]/25 active:scale-95 transition-all"
                >
                  <span>Start Tracking</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/discover"
                className="h-12 px-6 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#F5F7FA] border border-white/[0.1] hover:border-white/[0.2] font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Explore Discover</span>
                <Compass className="w-4 h-4 text-[#3B9EFF]" />
              </Link>
            </div>

            {/* Level 5: Compact Feature Benefits Row */}
            <div className="pt-4 border-t border-white/[0.08] w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[#A8B0BD]">
                <CheckCircle2 className="w-4 h-4 text-[#3B9EFF] shrink-0" />
                <span className="truncate">Track library</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#A8B0BD]">
                <Star className="w-4 h-4 text-[#F5C84B] shrink-0 fill-[#F5C84B]/20" />
                <span className="truncate">Rate & review</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#A8B0BD]">
                <Compass className="w-4 h-4 text-[#3B9EFF] shrink-0" />
                <span className="truncate">Discover next</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#A8B0BD]">
                <Share2 className="w-4 h-4 text-[#A8B0BD] shrink-0" />
                <span className="truncate">Share profile</span>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Cinematic Artwork Ecosystem (Movie + TV + Anime) */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] flex items-center justify-center">
              {/* Back Card 1: TV Series Card (Staggered Left) */}
              <div className="absolute -left-2 sm:-left-4 top-6 w-36 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#151C27] rotate-[-5deg] opacity-75 hover:opacity-100 hover:rotate-[-2deg] transition-all duration-300 z-10">
                <img
                  src={tv.posterPath}
                  alt={tv.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#3B9EFF]">
                    TV SERIES
                  </span>
                  <span className="text-[11px] font-semibold text-white truncate">
                    {tv.title}
                  </span>
                  {tv.currentEpisode && (
                    <span className="text-[9px] text-[#A8B0BD]">
                      Ep {tv.currentEpisode}/{tv.totalEpisodes || 10} • Watching
                    </span>
                  )}
                </div>
              </div>

              {/* Back Card 2: Anime Card (Staggered Right) */}
              <div className="absolute -right-2 sm:-right-4 top-8 w-36 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#151C27] rotate-[6deg] opacity-75 hover:opacity-100 hover:rotate-[3deg] transition-all duration-300 z-10">
                <img
                  src={anime.posterPath}
                  alt={anime.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#F5C84B]">
                    ANIME
                  </span>
                  <span className="text-[11px] font-semibold text-white truncate">
                    {anime.title}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-[#F5C84B]">
                    <Star className="w-2.5 h-2.5 fill-[#F5C84B]" />
                    <span>{anime.rating || 9.4}</span>
                  </div>
                </div>
              </div>

              {/* Center Main Featured Card: Primary Movie */}
              <Link
                href={`/${movie.mediaType || "movie"}/${movie.sourceId || "693134"}`}
                className="relative w-48 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/[0.14] bg-[#1D2734] z-20 transition-transform duration-300 hover:scale-[1.03] group block"
              >
                <img
                  src={movie.posterPath || "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg"}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                {/* Soft natural edge gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-[#0F141D]/20 to-transparent" />

                {/* Rating Badge Top Right */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#0F141D]/80 backdrop-blur-md border border-white/[0.1] flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-[#F5C84B] text-[#F5C84B]" />
                  <span className="text-xs font-bold text-[#F5C84B]">
                    {movie.rating ? Number(movie.rating).toFixed(1) : "8.8"}
                  </span>
                </div>

                {/* Featured Movie Label & Quick Info Bottom */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#3B9EFF]/90 text-[9px] font-bold tracking-wider uppercase text-white shadow-sm">
                      FEATURED
                    </span>
                    <span className="text-[10px] text-[#A8B0BD]">{movie.year || "2024"}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#F5F7FA] truncate group-hover:text-[#3B9EFF] transition-colors">
                    {movie.title}
                  </h3>
                </div>
              </Link>

              {/* Floating Letterboxd-style tracking pill bottom-left */}
              <div className="absolute -bottom-2 left-4 sm:left-6 z-30 px-3 py-1.5 rounded-lg bg-[#151C27]/95 backdrop-blur-md border border-white/[0.1] shadow-xl flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="font-semibold text-white">Movie · Series · Anime</span>
                <span className="text-[#6F7886]">• 1 Platform</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
