"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film,
  Tv,
  Star,
  CheckCircle2,
  BookmarkPlus,
  PlayCircle,
  Check,
  ArrowRight,
  Send,
  Zap,
  Share2,
  ExternalLink,
  Layers,
  Smile,
  Flame,
  Search,
  Copy,
  TrendingUp,
  Award,
  ShieldCheck,
  ChevronRight,
  Compass,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { MediaCard } from "@/components/media/media-card";
import { NormalizedMedia } from "@/lib/media/normalize";

// Highlights catalog organized by category matching Discover page design
const HIGHLIGHT_MOVIES_BY_CATEGORY: Record<string, NormalizedMedia[]> = {
  all: [
    {
      id: "tmdb:movie:693134",
      source: "tmdb",
      sourceId: "693134",
      mediaType: "movie",
      title: "Dune: Part Two",
      year: "2024",
      rating: 8.9,
      posterPath: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 166,
      genres: ["Sci-Fi", "Adventure"],
    },
    {
      id: "tmdb:movie:915935",
      source: "tmdb",
      sourceId: "915935",
      mediaType: "movie",
      title: "Anatomy of a Fall",
      year: "2023",
      rating: 8.8,
      posterPath: "https://image.tmdb.org/t/p/w500/1ho0d4LNZw3Y0voeKmSvPSgJOJ2.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 151,
      genres: ["Thriller", "Drama"],
    },
    {
      id: "tmdb:movie:467244",
      source: "tmdb",
      sourceId: "467244",
      mediaType: "movie",
      title: "The Zone of Interest",
      year: "2023",
      rating: 8.7,
      posterPath: "https://image.tmdb.org/t/p/w500/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 105,
      genres: ["Drama", "History"],
    },
    {
      id: "tmdb:movie:666277",
      source: "tmdb",
      sourceId: "666277",
      mediaType: "movie",
      title: "Past Lives",
      year: "2023",
      rating: 8.9,
      posterPath: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 106,
      genres: ["Romance", "Drama"],
    },
  ],
  theaters: [
    {
      id: "tmdb:movie:693134",
      source: "tmdb",
      sourceId: "693134",
      mediaType: "movie",
      title: "Dune: Part Two",
      year: "2024",
      rating: 8.9,
      posterPath: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 166,
      genres: ["Sci-Fi", "Adventure"],
    },
    {
      id: "tmdb:movie:786892",
      source: "tmdb",
      sourceId: "786892",
      mediaType: "movie",
      title: "Furiosa: A Mad Max Saga",
      year: "2024",
      rating: 8.6,
      posterPath: "https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 148,
      genres: ["Action", "Sci-Fi"],
    },
    {
      id: "tmdb:movie:937287",
      source: "tmdb",
      sourceId: "937287",
      mediaType: "movie",
      title: "Challengers",
      year: "2024",
      rating: 8.4,
      posterPath: "https://image.tmdb.org/t/p/w500/H6vke7zGiuLsz4v4RPeReb9rsv.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 131,
      genres: ["Drama", "Romance"],
    },
    {
      id: "tmdb:movie:929590",
      source: "tmdb",
      sourceId: "929590",
      mediaType: "movie",
      title: "Civil War",
      year: "2024",
      rating: 8.5,
      posterPath: "https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 109,
      genres: ["War", "Action"],
    },
  ],
  netflix: [
    {
      id: "tmdb:movie:666277",
      source: "tmdb",
      sourceId: "666277",
      mediaType: "movie",
      title: "Past Lives",
      year: "2023",
      rating: 8.9,
      posterPath: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 106,
      genres: ["Romance", "Drama"],
    },
    {
      id: "tmdb:movie:906126",
      source: "tmdb",
      sourceId: "906126",
      mediaType: "movie",
      title: "Society of the Snow",
      year: "2023",
      rating: 8.7,
      posterPath: "https://image.tmdb.org/t/p/w500/2e853FDVSIso600RqAMunPxiZjq.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 144,
      genres: ["Adventure", "Drama"],
    },
    {
      id: "tmdb:movie:974635",
      source: "tmdb",
      sourceId: "974635",
      mediaType: "movie",
      title: "Hit Man",
      year: "2023",
      rating: 8.5,
      posterPath: "https://image.tmdb.org/t/p/w500/oil3EZwKFp3CWxZnfGfGglesvm9.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 115,
      genres: ["Comedy", "Romance"],
    },
    {
      id: "tmdb:movie:661374",
      source: "tmdb",
      sourceId: "661374",
      mediaType: "movie",
      title: "Glass Onion",
      year: "2022",
      rating: 8.6,
      posterPath: "https://image.tmdb.org/t/p/w500/vDGr1YdrlfbU9wxTOdpf3zChmv9.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 139,
      genres: ["Mystery", "Comedy"],
    },
  ],
  critics: [
    {
      id: "tmdb:movie:915935",
      source: "tmdb",
      sourceId: "915935",
      mediaType: "movie",
      title: "Anatomy of a Fall",
      year: "2023",
      rating: 8.8,
      posterPath: "https://image.tmdb.org/t/p/w500/1ho0d4LNZw3Y0voeKmSvPSgJOJ2.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 151,
      genres: ["Thriller", "Drama"],
    },
    {
      id: "tmdb:movie:467244",
      source: "tmdb",
      sourceId: "467244",
      mediaType: "movie",
      title: "The Zone of Interest",
      year: "2023",
      rating: 8.7,
      posterPath: "https://image.tmdb.org/t/p/w500/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 105,
      genres: ["Drama", "History"],
    },
    {
      id: "tmdb:movie:666277",
      source: "tmdb",
      sourceId: "666277",
      mediaType: "movie",
      title: "Past Lives",
      year: "2023",
      rating: 8.9,
      posterPath: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 106,
      genres: ["Romance", "Drama"],
    },
    {
      id: "tmdb:movie:872585",
      source: "tmdb",
      sourceId: "872585",
      mediaType: "movie",
      title: "Oppenheimer",
      year: "2023",
      rating: 8.9,
      posterPath: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      backdropPath: null,
      totalEpisodes: 1,
      runtime: 180,
      genres: ["History", "Drama"],
    },
  ],
};

// 1-line curator notes connecting highlight titles to curator value proposition
const CURATOR_NOTES: Record<string, string> = {
  "tmdb:movie:693134": "Must-watch in IMAX 70mm",
  "tmdb:movie:915935": "Tightest screenplay of 2023",
  "tmdb:movie:467244": "Sound design masterclass",
  "tmdb:movie:666277": "Most tender romance in years",
  "tmdb:movie:786892": "Relentless visual spectacle",
  "tmdb:movie:937287": "Electric score & dynamic pacing",
  "tmdb:movie:929590": "Unflinching, intense ride",
  "tmdb:movie:906126": "Visceral survival cinema",
  "tmdb:movie:974635": "Charismatic & laugh-out-loud funny",
  "tmdb:movie:661374": "Witty whodunnit ensemble",
  "tmdb:movie:872585": "Peak cinematic tension",
};

export function LandingView() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [claimUsername, setClaimUsername] = useState("");
  const [copiedProfile, setCopiedProfile] = useState(false);
  const [copiedStep3, setCopiedStep3] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentCategoryMovies =
    HIGHLIGHT_MOVIES_BY_CATEGORY[activeCategory] || HIGHLIGHT_MOVIES_BY_CATEGORY.all;

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText("https://cinetrack.xyz/@rifat");
    setCopiedProfile(true);
    setTimeout(() => setCopiedProfile(false), 2500);
  };

  const handleCopyStep3 = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("https://cinetrack.xyz/@you");
    setCopiedStep3(true);
    setTimeout(() => setCopiedStep3(false), 2000);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimUsername.trim()) {
      router.push(`/login?username=${encodeURIComponent(claimUsername.trim())}&mode=signup`);
    } else {
      router.push("/login?mode=signup");
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0F141D] text-[#F5F7FA] selection:bg-[#3B9EFF]/30 selection:text-white antialiased">
      {/* 0. FIXED TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#0F141D]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="h-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 lg:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <LogoIcon className="w-8 h-8" size={32} priority />
              <span className="font-bold text-lg text-[#F5F7FA] tracking-tight group-hover:text-[#3B9EFF] transition-colors">
                Cine<span className="text-[#3B9EFF]">Track</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-semibold text-[#A8B0BD]">
              <Link href="/discover" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#3B9EFF]" />
                <span>Discover</span>
              </Link>
              <Link href="/search" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </Link>
              <a href="#demo-section" className="hover:text-white transition-colors cursor-pointer">
                Trending
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">
                How It Works
              </a>
              <a href="#curator-profile" className="hover:text-white transition-colors cursor-pointer">
                Curator Identity
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden xs:inline-block px-3 py-1.5 text-xs font-semibold text-[#A8B0BD] hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?mode=signup"
              className="px-3.5 sm:px-4 py-2 bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-xs rounded-lg shadow-sm shadow-[#3B9EFF]/25 transition-all active:scale-95 flex items-center justify-center cursor-pointer animate-[glow_2s_ease-in-out_1]"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#CBD5E1] hover:text-white transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] bg-[#0F141D]/95 backdrop-blur-2xl px-5 py-4 flex flex-col gap-3 shadow-2xl">
            <nav className="flex flex-col gap-1 text-sm font-medium text-[#A8B0BD]">
              <Link
                href="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Compass className="w-4 h-4 text-[#3B9EFF]" />
                <span>Discover</span>
              </Link>
              <Link
                href="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Search className="w-4 h-4 text-[#3B9EFF]" />
                <span>Search</span>
              </Link>
              <a
                href="#demo-section"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Star className="w-4 h-4 text-[#F5C84B]" />
                <span>Trending Highlights</span>
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Layers className="w-4 h-4 text-[#3B9EFF]" />
                <span>How It Works</span>
              </a>
              <a
                href="#curator-profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#3B9EFF]" />
                <span>Curator Identity</span>
              </a>
            </nav>

            <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold text-[#A8B0BD] hover:text-white bg-white/[0.04] rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login?mode=signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-semibold text-white bg-[#3B9EFF] hover:bg-[#5AAFFF] rounded-lg transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="w-full pt-16 flex-1 flex flex-col">
        {/* 1. NETFLIX-STYLE MINIMAL HERO SECTION */}
        <section className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] overflow-hidden bg-[#0F141D] flex flex-col justify-center items-center text-center">
          {/* Full-Display Cinematic Poster Wall Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src="/hero-background.jpeg"
              alt="CineTrack Poster Wall"
              className="w-full h-full object-cover object-center scale-105"
            />
            {/* Netflix-style balanced dark tint: covers entire screen uniformly so posters are crisp yet text has 100% readability */}
            <div className="absolute inset-0 bg-black/60 sm:bg-black/55 backdrop-brightness-[0.9]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-transparent to-[#0F141D]/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#0F141D_90%)] opacity-80" />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center">
            {/* Top Pill Badge */}
            <ScrollReveal delay={40} distance={15}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md mb-6 shadow-lg shadow-black/20 hover:border-[#3B9EFF]/40 transition-colors cursor-default select-none">
                <span className="w-2 h-2 rounded-full bg-[#3B9EFF] animate-pulse" />
                <span className="text-xs font-semibold text-[#E2E8F0] tracking-wide">
                  The Modern Cinematic Watch Library
                </span>
              </div>
            </ScrollReveal>

            {/* Main CineTrack Headline */}
            <ScrollReveal delay={100} distance={20}>
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-black tracking-tight text-white leading-[1.12] mb-3 sm:mb-4 drop-shadow-md text-center">
                <span className="sm:whitespace-nowrap">Track what you watch.</span>{" "}
                <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#3B9EFF] via-[#60A5FA] to-[#93C5FD] bg-clip-text text-transparent sm:whitespace-nowrap">
                  Recommend what they&apos;ll love.
                </span>
              </h1>
            </ScrollReveal>

            {/* Subtitle */}
            <ScrollReveal delay={200} distance={20}>
              <p className="text-sm sm:text-base lg:text-lg text-[#CBD5E1] max-w-2xl mx-auto mb-6 sm:mb-8 font-normal leading-relaxed drop-shadow">
                CineTrack organizes every movie, series, and anime you&apos;ve ever experienced. When friends ask for a recommendation, send tailored picks by vibe or share your profile link instantly.
              </p>
            </ScrollReveal>

            {/* Dual Action Buttons */}
            <ScrollReveal delay={320} distance={20}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
                <Link
                  href="/login?mode=signup"
                  className="w-full sm:w-auto h-12 sm:h-13 px-8 bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(59,158,255,0.35)] hover:shadow-[0_0_32px_rgba(59,158,255,0.5)] transition-all active:scale-95 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>

                <Link
                  href="/discover"
                  className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-7 bg-[#1A2330]/80 hover:bg-[#253244] border border-white/[0.12] hover:border-white/[0.24] text-[#F5F7FA] font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition-all backdrop-blur-sm active:scale-95 shadow-sm"
                >
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B9EFF]" />
                  <span>Explore Discover</span>
                </Link>
              </div>
            </ScrollReveal>

            {/* Trust / Benefit micro indicators */}
            <ScrollReveal delay={380} distance={15}>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-8 text-[11px] sm:text-xs text-[#8B95A5] font-medium select-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Free Forever
                </span>
                <span className="text-white/20">•</span>
                <span>No Credit Card</span>
                <span className="text-white/20">•</span>
                <span>Instant Setup</span>
              </div>
            </ScrollReveal>
          </div>

          {/* Netflix Signature Curved Bottom Arch Separator */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[140%] h-24 rounded-[100%] border-t-2 border-[#3B9EFF]/30 bg-gradient-to-b from-[#3B9EFF]/5 to-transparent pointer-events-none" />
        </section>

        {/* 2. "HOW IT WORKS IN 3 SIMPLE STEPS" */}
        <section id="how-it-works" className="w-full bg-[#171C25] py-16 lg:py-20 border-y border-white/[0.06]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <ScrollReveal distance={24}>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-3">
                <div>
                  <div className="text-[#3B9EFF] text-[11px] font-bold tracking-wider uppercase mb-1">
                    The Experience
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
                    How It Works in 3 Simple Steps
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#A8B0BD] max-w-md leading-relaxed">
                  Built for film lovers who take pride in their watchlists and want zero friction
                  when recommending cinema to others.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 01 */}
              <ScrollReveal delay={100} distance={28} className="h-full">
                <div className="bg-gradient-to-b from-[#1D2734] to-[#151D28] rounded-xl p-5 sm:p-6 flex flex-col shadow-sm border border-white/[0.06] hover:border-[#3B9EFF]/30 hover:shadow-[0_8px_30px_rgba(59,158,255,0.08)] transition-all duration-300 h-full">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="font-bold text-sm text-[#F5F7FA]">1. Log What You Watch</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1B2029] text-[#A8B0BD]">
                        01
                      </span>
                    </div>
                    <p className="text-xs text-[#A8B0BD] mb-4 leading-relaxed">
                      Track films, series &amp; anime in one tap. Set your personal tier (★ Masterpiece, Great, Good) and jot 1-line curator notes.
                    </p>
                  </div>

                  {/* Mini Mock Log with Poster Thumbnail & Masterpiece Badge */}
                  <div className="bg-[#090E17] p-3.5 rounded-xl border border-white/[0.06] flex flex-col gap-2.5 mt-auto">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#6F7886] uppercase tracking-wide">
                      <span>Recent Log</span>
                      <span className="text-[#3B9EFF] font-semibold">Just Added</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-16 rounded bg-[#161E2C] shrink-0 overflow-hidden shadow-sm border border-white/[0.06]">
                        <img
                          src="https://image.tmdb.org/t/p/w500/tCZFfYTIwrR7n94J6G14Y4hAFU6.jpg"
                          alt="Death Note"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-[#F5F7FA] truncate">
                            Death Note
                          </span>
                          <span className="text-[10px] font-mono text-[#6F7886] shrink-0">
                            2006
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F5C84B]/10 border border-[#F5C84B]/25 text-[#F5C84B] text-[9px] font-extrabold uppercase tracking-wide">
                            <Star className="w-2.5 h-2.5 fill-[#F5C84B]" />
                            <span>MASTERPIECE</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[9px] font-bold uppercase tracking-wider">
                            <Check className="w-2.5 h-2.5" />
                            <span>LOGGED</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-[#A8B0BD] italic truncate">
                          &ldquo;Peak psychological battle of wits.&rdquo;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px] text-[#6F7886]">
                      <span>Anime Series • Madhouse</span>
                      <span className="text-[#F5C84B] font-semibold">Tier 1 • Essential</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Step 02 */}
              <ScrollReveal delay={200} distance={28} className="h-full">
                <div className="bg-gradient-to-b from-[#1D2734] to-[#151D28] rounded-xl p-5 sm:p-6 flex flex-col shadow-sm border border-white/[0.06] hover:border-[#3B9EFF]/30 hover:shadow-[0_8px_30px_rgba(59,158,255,0.08)] transition-all duration-300 h-full">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="font-bold text-sm text-[#F5F7FA]">2. Friend Asks for a Pick</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1B2029] text-[#A8B0BD]">
                        02
                      </span>
                    </div>
                    <p className="text-xs text-[#A8B0BD] mb-4 leading-relaxed">
                      Friend asks: &ldquo;Got any sci-fi epic on Netflix?&rdquo; Filter your personal vault by vibe &amp; platform in 2 clicks.
                    </p>
                  </div>

                  {/* Mini Mock Vibe & Filter Query */}
                  <div className="bg-[#090E17] p-3.5 rounded-xl border border-white/[0.06] flex flex-col gap-2.5 mt-auto">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#6F7886] uppercase tracking-wide">
                      <span>Vault Filter</span>
                      <span className="text-[#22C55E] flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                        3 Matched
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center gap-1 bg-[#3B9EFF]/15 border border-[#3B9EFF]/30 text-[#60A5FA] px-2 py-0.5 rounded-md text-[10px] font-bold">
                        <span>🌌 Sci-Fi Epic</span>
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#1A2330] border border-white/[0.08] text-[#E2E8F0] px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                        <span>Netflix</span>
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#F5C84B]/10 border border-[#F5C84B]/20 text-[#F5C84B] px-2 py-0.5 rounded-md text-[10px] font-bold">
                        <span>★ Masterpieces</span>
                      </span>
                    </div>

                    {/* Matched Movie Result Card */}
                    <div className="bg-[#121824] p-2.5 rounded-lg border border-white/[0.08] flex items-center gap-3">
                      <div className="w-10 h-14 rounded bg-[#161E2C] shrink-0 overflow-hidden shadow-sm border border-white/[0.08]">
                        <img
                          src="https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
                          alt="Interstellar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-[#F5F7FA] truncate">
                            Interstellar
                          </span>
                          <span className="text-[10px] font-mono text-[#6F7886] shrink-0">
                            2014
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F5C84B]/10 border border-[#F5C84B]/20 text-[#F5C84B] text-[9px] font-bold uppercase tracking-wider">
                            <Star className="w-2.5 h-2.5 fill-[#F5C84B]" />
                            <span>8.9 TMDb</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[9px] font-bold uppercase tracking-wider">
                            <span>98% MATCH</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-[#A8B0BD] truncate">
                          Sci-Fi Epic • Christopher Nolan • On Netflix
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px]">
                      <div className="flex items-center gap-1 text-[#6F7886] font-medium">
                        <Zap className="w-3 h-3 text-[#F5C84B]" />
                        <span>Filtered in 0.02s</span>
                      </div>
                      <span className="text-[#3B9EFF] font-semibold">Instant Pick</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Step 03 - Upgraded Curator Share Card */}
              <ScrollReveal delay={300} distance={28} className="h-full">
                <div className="bg-gradient-to-b from-[#1D2734] to-[#151D28] rounded-xl p-5 sm:p-6 flex flex-col shadow-sm border border-white/[0.06] hover:border-[#3B9EFF]/30 hover:shadow-[0_8px_30px_rgba(59,158,255,0.08)] transition-all duration-300 h-full">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="font-bold text-sm text-[#F5F7FA]">3. Share Instantly</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1B2029] text-[#A8B0BD]">
                        03
                      </span>
                    </div>
                    <p className="text-xs text-[#A8B0BD] mb-4 leading-relaxed">
                      No messy text lists. Dispatch your curated film card or share your clean public profile{" "}
                      <code className="text-[#3B9EFF] font-mono text-[11px]">cinetrack.xyz/@you</code>.
                    </p>
                  </div>

                  {/* Mini CineTrack Curator Share Card */}
                  <div className="bg-[#090E17] p-3.5 rounded-xl border border-white/[0.06] flex flex-col gap-2.5 mt-auto">
                    {/* Header with avatar & handle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#3B9EFF] to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          Y
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold text-[#F5F7FA]">@you</span>
                          <CheckCircle2 className="w-3 h-3 text-[#3B9EFF]" />
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        3 Picks Ready
                      </span>
                    </div>

                    {/* 3 Mini Overlapping Fan Posters with guaranteed working URLs */}
                    <div className="flex items-center justify-center gap-2 py-0.5">
                      <div className="w-12 h-16 rounded bg-[#1A2330] overflow-hidden shadow-md border border-white/10 -rotate-3 hover:rotate-0 transition-transform">
                        <img
                          src="https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
                          alt="Oppenheimer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-13 h-18 rounded bg-[#1A2330] overflow-hidden shadow-lg border border-[#3B9EFF]/40 z-10 scale-105">
                        <img
                          src="https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg"
                          alt="Dune 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-12 h-16 rounded bg-[#1A2330] overflow-hidden shadow-md border border-white/10 rotate-3 hover:rotate-0 transition-transform">
                        <img
                          src="https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"
                          alt="Parasite"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Interactive Copy Button */}
                    <button
                      type="button"
                      onClick={handleCopyStep3}
                      className="w-full h-7 px-2.5 rounded-md bg-[#1A2330] hover:bg-[#222E3F] text-[10px] font-semibold text-[#CBD5E1] hover:text-white border border-white/[0.08] hover:border-[#3B9EFF]/40 flex items-center justify-between transition-all active:scale-98 cursor-pointer select-none"
                    >
                      <span className="font-mono text-[#8B95A5] truncate">
                        cinetrack.xyz/@you
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#3B9EFF] font-bold shrink-0 ml-1.5">
                        {copiedStep3 ? (
                          <>
                            <Check className="w-3 h-3 text-[#22C55E]" />
                            <span className="text-[#22C55E]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>


        {/* 3. INTERACTIVE "TRY THE RECOMMENDER" / THIS WEEK'S HIGHLIGHTS */}
        <section
          id="demo-section"
          className="w-full bg-[#0F1318] max-w-none px-4 sm:px-6 lg:px-12 py-16 lg:py-20"
        >
          <ScrollReveal distance={24}>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2029] text-[#A1C9FF] text-[11px] font-semibold tracking-widest uppercase mb-3 shadow-sm border border-white/[0.06]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B9EFF] animate-pulse" />
                THIS WEEK&apos;S HIGHLIGHTS
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mb-2">
                See the best movies of this week
              </h2>
              <p className="text-xs sm:text-sm text-[#A8B0BD]">
                The highest-rated cinema currently trending across streaming services, curated from
                CineTrack members&apos; logs.
              </p>
            </div>
          </ScrollReveal>

          {/* Filter Category Chips */}
          <ScrollReveal delay={100} distance={20}>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {[
                { id: "all", label: "All Top Rated", icon: Star },
                { id: "theaters", label: "In Theaters & Digital", icon: Film },
                { id: "netflix", label: "Trending on Netflix", dot: "bg-[#F43F5E]" },
                { id: "critics", label: "Critically Acclaimed", icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none active:scale-95 outline-none focus:outline-none focus-visible:outline-none border ${
                      isSelected
                        ? "bg-[#3B9EFF] text-white border-[#3B9EFF] shadow-sm shadow-[#3B9EFF]/20"
                        : "bg-[#1A2330] hover:bg-[#1D2734] text-[#A8B0BD] hover:text-[#F5F7FA] border-white/[0.06] hover:border-white/[0.14]"
                    }`}
                  >
                    {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </ScrollReveal>

          {/* 4 Featured Movie Cards matching Discover page design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 mb-8 max-w-[1440px] mx-auto">
            {currentCategoryMovies.map((movie, idx) => (
              <ScrollReveal
                key={`${activeCategory}-${movie.id}`}
                delay={idx * 80}
                distance={24}
                className="h-full"
              >
                <div className="flex flex-col h-full group/card">
                  <MediaCard
                    media={movie}
                    userRating={movie.rating >= 8.9 ? "masterpiece" : movie.rating >= 8.2 ? "great" : "good"}
                    readOnly={true}
                    className="w-full h-full"
                  />
                  {CURATOR_NOTES[movie.id] && (
                    <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-[#141A24] border border-white/[0.06] flex items-center gap-1.5 text-[11px] text-[#A8B0BD] group-hover/card:border-[#3B9EFF]/30 group-hover/card:text-[#F5F7FA] transition-colors">
                      <span className="text-[#3B9EFF] text-xs font-bold shrink-0">❝</span>
                      <span className="truncate italic">{CURATOR_NOTES[movie.id]}</span>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Action Row */}
          <ScrollReveal delay={150} distance={20}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-3.5 bg-[#1B2029] rounded-xl shadow-sm border border-white/[0.06]">
              <Link
                href="/search"
                className="w-full sm:w-auto h-10 px-5 bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span>Explore Full Weekly Top 50</span>
              </Link>

              <Link
                href="/discover"
                className="w-full sm:w-auto h-10 px-5 bg-[#1A2330] hover:bg-[#1D2734] text-[#3B9EFF] hover:text-[#5AAFFF] font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 border border-white/[0.08] hover:border-[#3B9EFF]/30 select-none active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Explore All on Discover</span>
              </Link>
            </div>
          </ScrollReveal>
        </section>



        {/* 4. THE SHAREABLE CURATOR PROFILE PREVIEW */}
        <section
          id="curator-profile"
          className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 border-t border-white/[0.04]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column */}
            <ScrollReveal delay={100} distance={28} className="lg:col-span-6 flex flex-col gap-4">
              <div className="text-[#3B9EFF] text-[11px] font-bold tracking-widest uppercase">
                Identity &amp; Taste
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA] leading-tight">
                Your Public Curator Identity <br />
                <span className="text-[#3B9EFF] font-mono text-xl sm:text-2xl font-normal">
                  cinetrack.xyz/@yourname
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#A8B0BD] leading-relaxed mb-2">
                Tired of friends asking what to watch over text, only to reject every title? Give
                them your personal catalog link.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1B2029] border border-white/[0.06] flex items-center justify-center shrink-0 text-[#3B9EFF]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#F5F7FA] mb-0.5">
                      Zero friction for friends
                    </h4>
                    <p className="text-xs text-[#A8B0BD] leading-relaxed">
                      They can browse your top favorites and filter your catalog without downloading
                      an app or making an account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1B2029] border border-white/[0.06] flex items-center justify-center shrink-0 text-[#F5C84B]">
                    <Star className="w-4 h-4 fill-[#F5C84B]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#F5F7FA] mb-0.5">
                      Top All-Time Favorites
                    </h4>
                    <p className="text-xs text-[#A8B0BD] leading-relaxed">
                      Showcase your foundational masterpieces in cinematic high fidelity right at
                      the top of your profile.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1B2029] border border-white/[0.06] flex items-center justify-center shrink-0 text-[#22C55E]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#F5F7FA] mb-0.5">
                      Real taste compatibility
                    </h4>
                    <p className="text-xs text-[#A8B0BD] leading-relaxed">
                      Friends instantly see their taste match percentage with you based on mutually
                      rated cinema.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/library"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B9EFF] hover:text-[#5AAFFF] transition-colors"
                >
                  <span>Explore Demo Profile (@rifat)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Right Column: Clean Preview Card */}
            <ScrollReveal delay={220} distance={28} className="lg:col-span-6">
              <div className="bg-[#1D2734] p-5 sm:p-7 rounded-2xl shadow-xl max-w-lg mx-auto border border-white/[0.08]">
                {/* Profile header inside preview */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#3B9EFF] to-blue-700 flex items-center justify-center font-bold text-lg text-white shadow-md">
                      R
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-[#F5F7FA]">Rifat</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3B9EFF]" />
                      </div>
                      <div className="text-[11px] text-[#6F7886] font-mono">
                        cinetrack.xyz/@rifat
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">
                      94% Taste Match
                    </span>
                    <span className="text-base font-bold text-[#F5F7FA]">
                      648 <span className="text-xs font-normal text-[#6F7886]">Logged</span>
                    </span>
                  </div>
                </div>

                {/* Taste Badges */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="px-2 py-0.5 rounded bg-[#1A2330] text-[#3B9EFF] text-[10px] font-bold border border-white/[0.04]">
                    A24 Devotee
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1A2330] text-[#FFB873] text-[10px] font-bold border border-white/[0.04]">
                    Sci-Fi Epic
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1A2330] text-[#F5C84B] text-[10px] font-bold border border-white/[0.04]">
                    Korean Thrillers
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1A2330] text-[#A8B0BD] text-[10px] font-bold border border-white/[0.04]">
                    Anime Classics
                  </span>
                </div>

                {/* Mini 4 Favorites Grid */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#6F7886] mb-2 uppercase tracking-wide">
                    <span>Curator&apos;s Top 4 All-Time</span>
                    <span className="text-[#F5C84B]">★ 10/10 Tier</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="aspect-[2/3] rounded-lg bg-[#1B2029] overflow-hidden relative shadow-sm border border-white/[0.04]">
                      <img
                        src="https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"
                        alt="Blade Runner 2049"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-[2/3] rounded-lg bg-[#1B2029] overflow-hidden relative shadow-sm border border-white/[0.04]">
                      <img
                        src="https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"
                        alt="Parasite"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-[2/3] rounded-lg bg-[#1B2029] overflow-hidden relative shadow-sm border border-white/[0.04]">
                      <img
                        src="https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg"
                        alt="Spirited Away"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-[2/3] rounded-lg bg-[#1B2029] overflow-hidden relative shadow-sm border border-white/[0.04]">
                      <img
                        src="https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
                        alt="Interstellar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Profile Link Simulation */}
                <div className="bg-[#1A2330] p-2.5 rounded-lg flex items-center justify-between text-xs text-[#A8B0BD] border border-white/[0.06]">
                  <span className="flex items-center gap-1.5 truncate">
                    <Share2 className="w-3.5 h-3.5 text-[#3B9EFF]" />
                    <span className="font-mono text-[11px]">cinetrack.xyz/@rifat/recommend</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyProfileLink}
                    className="text-xs font-bold text-[#3B9EFF] hover:text-[#5AAFFF] cursor-pointer shrink-0 ml-2 select-none outline-none focus:outline-none focus-visible:outline-none active:scale-95 transition-transform"
                  >
                    {copiedProfile ? "Copied!" : "Open"}
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>


        {/* 5. BOTTOM MINIMAL CALL-TO-ACTION */}
        <section className="w-full bg-gradient-to-b from-[#0F141D] to-[#0D1117] max-w-none px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
          <ScrollReveal distance={32}>
            <div className="bg-[#1D2734] rounded-2xl p-8 sm:p-12 md:p-16 flex flex-col items-center text-center shadow-xl border border-white/[0.08] relative overflow-hidden max-w-[1440px] mx-auto">
              {/* Subtle poster mosaic background */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
                <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-10 gap-1 p-2">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-white/20 rounded-sm" />
                  ))}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#1A2330] flex items-center justify-center text-[#3B9EFF] mb-4 shadow-sm border border-white/[0.06] relative z-10">
                <Film className="w-6 h-6" />
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA] mb-2 max-w-xl">
                Ready to stop forgetting what you watched?
              </h2>
              <p className="text-xs sm:text-sm text-[#A8B0BD] max-w-lg mb-8 leading-relaxed">
                Build your vault in minutes. Free forever. No ads. Zero friction.
              </p>

              {/* Input Field Claim Form */}
              <form
                onSubmit={handleClaimSubmit}
                className="w-full max-w-md flex flex-col sm:flex-row gap-2.5 mb-5"
              >
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 text-[#6F7886] font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={claimUsername}
                    onChange={(e) => setClaimUsername(e.target.value)}
                    placeholder="yourname"
                    required
                    className="w-full h-11 pl-8 pr-3.5 bg-[#1B2029] rounded-lg text-[#F5F7FA] placeholder-[#4B5563] text-xs sm:text-sm border border-white/[0.08] focus:outline-none focus:border-[#3B9EFF] shadow-inner transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-6 bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-[#3B9EFF]/20 transition-all cursor-pointer whitespace-nowrap active:scale-95 select-none outline-none focus:outline-none focus-visible:outline-none border border-[#3B9EFF]"
                >
                  <span>Claim Your Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Social proof mini anime avatars */}
              <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
                <div className="flex -space-x-2">
                  {[
                    { src: "/avatars/user-avatar-1.jpeg", alt: "Anime avatar 1" },
                    { src: "/avatars/user-avatar-2.jpeg", alt: "Nobita avatar" },
                    { src: "/avatars/user-avatar-3.jpeg", alt: "Tom avatar" },
                    { src: "/avatars/user-avatar-4.jpeg", alt: "Shin-chan avatar" },
                    { src: "/avatars/user-avatar-5.jpeg", alt: "Jack avatar" },
                  ].map((avatar, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#1D2734] shadow-sm shrink-0 bg-[#161D28]"
                    >
                      <img
                        src={avatar.src}
                        alt={avatar.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-[#A8B0BD] ml-1">Join 850+ members</span>
              </div>

              {/* Discreet Status & Privacy Notes */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-[#6F7886] uppercase tracking-wider relative z-10">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  Free Forever
                </span>
                <span>•</span>
                <span>Instant Setup</span>
                <span>•</span>
                <span>No Credit Card Required</span>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* 6. FOOTER */}
      <footer className="w-full bg-[#121824] border-t border-white/[0.06] mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-12 lg:pt-14 pb-6 sm:pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 sm:mb-10">
            {/* Col 1: Brand & Tagline */}
            <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <LogoIcon className="w-7 h-7" size={28} />
                <span className="font-bold text-lg text-[#F5F7FA] tracking-tight group-hover:text-[#3B9EFF] transition-colors">
                  Cine<span className="text-[#3B9EFF]">Track</span>
                </span>
              </Link>
              <p className="text-xs text-[#8B95A5] leading-relaxed max-w-xs">
                A fast, minimal, worldwide social tracking platform to discover, track, rate, review, and share movies, TV series, and anime.
              </p>
            </div>

            {/* Col 2: Discover & Track */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">Explore</h3>
              <nav className="flex flex-col gap-2 text-xs text-[#A8B0BD]">
                <Link href="/discover" className="hover:text-white transition-colors">Discover Catalog</Link>
                <Link href="/search" className="hover:text-white transition-colors">Search Titles</Link>
                <a href="#demo-section" className="hover:text-white transition-colors cursor-pointer">This Week&apos;s Highlights</a>
                <a href="#curator-profile" className="hover:text-white transition-colors cursor-pointer">Public Profile Demo</a>
              </nav>
            </div>

            {/* Col 3: Product & Community */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">Community & Info</h3>
              <nav className="flex flex-col gap-2 text-xs text-[#A8B0BD]">
                <Link href="/about" className="hover:text-white transition-colors">About CineTrack</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link>
                <Link href="/feedback" className="hover:text-white transition-colors text-[#3B9EFF] hover:text-[#5AAFFF] font-semibold inline-flex items-center gap-1">Need a New Feature? <ArrowRight className="w-3 h-3" /></Link>
              </nav>
            </div>

            {/* Col 4: Legal */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">Legal & Policy</h3>
              <nav className="flex flex-col gap-2 text-xs text-[#A8B0BD]">
                <Link href="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </nav>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F7886] pr-0 sm:pr-14">
            <span>
              &copy; {new Date().getFullYear()} CineTrack. All rights reserved.
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#6F7886]">
              <span>Built by</span>
              <a
                href="https://fahadislam.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-[#CBD5E1] hover:text-[#3B9EFF] transition-colors group"
              >
                <span className="relative">
                  Fahad Islam
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-[#3B9EFF] transition-all duration-200 group-hover:w-full" />
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#3B9EFF] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
