"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Play,
  Star,
  Check,
  BookmarkCheck,
  Info,
} from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { QuickAddModal } from "../quick-add/quick-add-modal";

interface HeroSlide {
  badge: string;
  media: NormalizedMedia;
  metaLine: string;
}

interface HeroBannerProps {
  user?: {
    username?: string;
    email?: string;
  } | null;
  featuredMedia?: NormalizedMedia | null;
  secondaryMedia?: NormalizedMedia | null;
}

export function HeroBanner({ user, featuredMedia, secondaryMedia }: HeroBannerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const isLoggedIn = !!user;
  const username = user?.username || user?.email?.split("@")[0] || "Cinephile";

  // Built-in curated slides representing Movie + TV + Anime
  const slides: HeroSlide[] = [
    {
      badge: "FEATURED FILM",
      metaLine: "2024 • Sci-Fi, Adventure • Movie Tracker",
      media: featuredMedia || {
        id: "tmdb:movie:693134",
        source: "tmdb",
        sourceId: "693134",
        mediaType: "movie",
        title: "Dune: Part Two",
        year: "2024",
        rating: 8.8,
        posterPath: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
        backdropPath: "https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
        genres: ["Sci-Fi", "Adventure"],
        synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
      },
    },
    {
      badge: "TRENDING SERIES",
      metaLine: "2024 • Animation, Sci-Fi • TV Tracker",
      media: secondaryMedia || {
        id: "tmdb:tv:94605",
        source: "tmdb",
        sourceId: "94605",
        mediaType: "series",
        title: "Arcane",
        year: "2024",
        rating: 9.1,
        posterPath: "https://image.tmdb.org/t/p/w500/abf8tHznhSvl9BAElD23cQaeCDW.jpg",
        backdropPath: "https://image.tmdb.org/t/p/w1280/fqldJn2tMkQggQi29HyjewmlvCw.jpg",
        genres: ["Animation", "Sci-Fi"],
        synopsis: "Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies.",
      },
    },
    {
      badge: "TOP ANIME SIMULCAST",
      metaLine: "2023 • Fantasy, Adventure • Anime Tracker",
      media: {
        id: "anilist:154587",
        source: "anilist",
        sourceId: "154587",
        mediaType: "anime",
        title: "Frieren: Beyond Journey's End",
        year: "2023",
        rating: 9.4,
        posterPath: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-gviZ2zfLIf0w.jpg",
        backdropPath: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-dr7e5m5h.jpg",
        genres: ["Fantasy", "Adventure"],
        synopsis: "An elf mage embarks on a nostalgic journey through places she once explored with the legendary hero party.",
      },
    },
  ];

  const currentSlide = slides[currentIdx] || slides[0];
  const media = currentSlide.media;
  const detailUrl = `/${media.mediaType}/${media.sourceId}`;
  const backdropUrl = media.backdropPath || media.posterPath || "/placeholder-backdrop.png";

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Previous and next indices for side preview cards
  const prevIdx = currentIdx === 0 ? slides.length - 1 : currentIdx - 1;
  const nextIdx = currentIdx === slides.length - 1 ? 0 : currentIdx + 1;

  return (
    <>
      <section className="relative w-full py-4 sm:py-6 overflow-hidden bg-[#0F141D]">
        {/* CAROUSEL CONTAINER WITH PEEK CARDS */}
        <div className="relative max-w-[1360px] mx-auto px-2 sm:px-4 md:px-8 flex items-center justify-center">
          
          {/* Left Peeking Card (Subtle edge bleed) */}
          <div
            onClick={prevSlide}
            className="hidden xl:block absolute -left-28 w-44 h-[440px] rounded-3xl overflow-hidden opacity-25 hover:opacity-40 transition-opacity cursor-pointer border border-white/[0.06] shadow-2xl pointer-events-auto"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('${slides[prevIdx].media.backdropPath || slides[prevIdx].media.posterPath}')`,
              }}
            />
            <div className="absolute inset-0 bg-[#0F141D]/70" />
          </div>

          {/* MAIN BILLBOARD STAGE CARD */}
          <div className="relative w-full h-[460px] sm:h-[490px] md:h-[510px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.8)] bg-[#151C27] flex flex-col justify-between">
            
            {/* Full-bleed High-Res Artwork */}
            <div
              key={media.id}
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out scale-[1.01]"
              style={{ backgroundImage: `url('${backdropUrl}')` }}
            />

            {/* Gradient Scrims (Flawless readability on left, cinematic transparency on right) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F141D] via-[#0F141D]/90 md:via-[#0F141D]/70 to-transparent w-full md:w-4/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-[#0F141D]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F141D]/40 via-transparent to-transparent" />

            {/* Top Bar inside Billboard (Eyebrow + Category Tag) */}
            <div className="relative z-10 p-6 sm:p-8 md:p-10 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/[0.1] shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B9EFF] animate-pulse shadow-[0_0_8px_#3B9EFF]" />
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#F5F7FA]">
                  {isLoggedIn ? `PERSONAL HUB • ${username.toUpperCase()}` : "YOUR PERSONAL MEDIA LIBRARY"}
                </span>
              </div>

              {/* Slide Counter / Category Badge */}
              <span className="px-3 py-1 rounded-full bg-white/[0.08] backdrop-blur-md text-[10px] sm:text-[11px] font-bold tracking-wider text-[#A8B0BD] uppercase border border-white/[0.08]">
                {currentSlide.badge}
              </span>
            </div>

            {/* Content Area inside Billboard (Left-Anchored Value Prop & Title) */}
            <div className="relative z-10 px-5 sm:px-10 md:pl-16 md:pr-8 pb-7 sm:pb-9 max-w-2xl flex flex-col items-start text-left">
              
              {/* Value Proposition Headline */}
              <h1 className="font-extrabold text-2xl sm:text-4xl md:text-[44px] tracking-tight text-[#F5F7FA] leading-[1.12] mb-2.5">
                {isLoggedIn ? (
                  <>Welcome back, <span className="text-[#3B9EFF]">{username}.</span></>
                ) : (
                  <>Everything You Watch, <span className="text-[#3B9EFF]">In One Place.</span></>
                )}
              </h1>

              {/* Dynamic Featured Media Title & Rating */}
              <div className="flex items-center gap-2 flex-wrap mb-2 text-xs font-semibold text-[#A8B0BD]">
                <div className="flex items-center gap-1 text-[#F5C84B]">
                  <Star className="w-3.5 h-3.5 fill-[#F5C84B]" />
                  <span className="font-bold text-sm text-[#F5F7FA]">
                    {media.rating ? Number(media.rating).toFixed(1) : "8.5"}
                  </span>
                </div>
                <span>•</span>
                <span className="text-white font-medium">{media.title}</span>
                <span>•</span>
                <span className="text-[#A8B0BD]">{currentSlide.metaLine}</span>
              </div>

              {/* Supporting Value Description (Clear in 3-5 seconds) */}
              <p className="text-xs sm:text-sm text-[#A8B0BD] line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl mb-5 sm:mb-6 font-normal">
                {isLoggedIn
                  ? "Resume your active watchlists, log your latest impressions, or discover recommendations tailored to your cinematic taste."
                  : "Track movies, TV shows, and anime. Rate what you watch, write reviews, discover what to watch next, and build your own cinematic profile."}
              </p>

              {/* Dual Action Buttons matching inspired-design.jpg */}
              <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="h-10 sm:h-12 px-5 sm:px-7 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#3B9EFF]/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Track This Title</span>
                </button>

                <Link
                  href={detailUrl}
                  className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl bg-black/40 hover:bg-black/60 text-[#F5F7FA] border border-white/[0.18] hover:border-white/[0.3] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>View Details</span>
                </Link>

                <Link
                  href="/discover"
                  className="hidden sm:flex h-10 sm:h-12 px-3.5 rounded-xl text-[#A8B0BD] hover:text-[#F5F7FA] font-medium text-xs sm:text-sm items-center justify-center transition-colors"
                >
                  <span>Explore Discover →</span>
                </Link>
              </div>
            </div>

            {/* Navigation Arrows on Left & Right Edges (Desktop only to prevent mobile text collision) */}
            <button
              type="button"
              onClick={prevSlide}
              className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-[#3B9EFF] text-white border border-white/[0.15] backdrop-blur-md items-center justify-center shadow-xl transition-all active:scale-90 z-20 cursor-pointer"
              title="Previous title"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-[#3B9EFF] text-white border border-white/[0.15] backdrop-blur-md items-center justify-center shadow-xl transition-all active:scale-90 z-20 cursor-pointer"
              title="Next title"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Right Peeking Card (Subtle edge bleed) */}
          <div
            onClick={nextSlide}
            className="hidden xl:block absolute -right-28 w-44 h-[440px] rounded-3xl overflow-hidden opacity-25 hover:opacity-40 transition-opacity cursor-pointer border border-white/[0.06] shadow-2xl pointer-events-auto"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('${slides[nextIdx].media.backdropPath || slides[nextIdx].media.posterPath}')`,
              }}
            />
            <div className="absolute inset-0 bg-[#0F141D]/70" />
          </div>
        </div>

        {/* Carousel Pagination Dots matching inspired-design.jpg */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIdx(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                index === currentIdx
                  ? "w-8 h-1.5 bg-[#3B9EFF] shadow-[0_0_8px_#3B9EFF]"
                  : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
              }`}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Quick Add Modal directly triggered by "Track This Title" */}
      <QuickAddModal
        media={media}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </>
  );
}
