"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Share2,
  ArrowRight,
  Compass,
  BookmarkPlus,
} from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { QuickAddModal } from "../quick-add/quick-add-modal";

interface HeroBannerProps {
  user?: {
    username?: string;
    email?: string;
  } | null;
  featuredMedia?: NormalizedMedia | null;
  secondaryMedia?: NormalizedMedia | null;
}

export function HeroBanner({ user, featuredMedia }: HeroBannerProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <>
      <section className="relative w-full min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] overflow-hidden bg-[#0F141D] flex items-center border-b border-white/[0.06]">
        {/* Full-Display Cinematic Poster Wall Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/hero-background.jpeg"
            alt="Cinematic Poster Wall"
            className="w-full h-full object-cover object-center scale-105"
          />

          {/* Scrim & Gradient Overlays for High-Contrast Readability & Seamless Blending */}
          <div className="absolute inset-0 bg-black/60 sm:bg-black/50 backdrop-brightness-[0.9]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F141D] via-[#0F141D]/75 sm:via-[#0F141D]/45 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-transparent to-[#0F141D]/80 z-10" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-20 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 sm:py-16 flex flex-col justify-center">
          <div className="max-w-2xl">
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151C27]/80 backdrop-blur-md border border-white/[0.08] text-[#3B9EFF] text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-4 w-fit shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B9EFF] animate-pulse" />
              <span>YOUR PERSONAL MEDIA LIBRARY</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold text-[#F5F7FA] tracking-tight leading-[1.1] mb-4">
              Everything You Watch, <br />
              <span className="text-[#3B9EFF]">In One Place.</span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-xs sm:text-base text-[#A8B0BD] max-w-xl mb-6 sm:mb-8 leading-relaxed font-normal">
              Track movies, TV shows, and anime. Rate what you watch, write reviews, discover what to watch next, and build your own cinematic profile.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 mb-7 sm:mb-8">
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="h-11 sm:h-12 px-6 sm:px-7 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-[#3B9EFF]/25 transition-all active:scale-95 cursor-pointer"
              >
                <span>Start Tracking</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/discover"
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-[#1A2330]/80 hover:bg-[#253244] text-[#F5F7FA] border border-white/[0.12] hover:border-white/[0.24] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-all backdrop-blur-sm active:scale-95 shadow-sm"
              >
                <Compass className="w-4 h-4 text-[#A8B0BD]" />
                <span>Explore Discover</span>
              </Link>
            </div>

            {/* 4-Feature Trust Checklist Row matching Reference Image */}
            <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2.5 pt-5 sm:pt-6 border-t border-white/[0.08] text-xs sm:text-sm font-medium text-[#CBD5E1]">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-[#3B9EFF]" />
                <span>Track your library</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#F5C84B] fill-[#F5C84B]" />
                <span>Rate &amp; review</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#3B9EFF]" />
                <span>Discover more</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#FFB873]" />
                <span>Share your profile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        media={
          featuredMedia || {
            id: "tmdb:movie:693134",
            source: "tmdb",
            sourceId: "693134",
            mediaType: "movie",
            title: "Dune: Part Two",
            year: "2024",
            rating: 8.9,
            totalEpisodes: 1,
            posterPath: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
            backdropPath: null,
            genres: ["Sci-Fi", "Adventure"],
          }
        }
      />
    </>
  );
}
