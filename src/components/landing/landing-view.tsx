"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Film,
  Tv,
  Sparkles,
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
} from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";

// 4 Highlight Cinema Cards from Section 3 of mockup
const HIGHLIGHT_MOVIES = [
  {
    title: "Dune: Part Two",
    year: "2024",
    genre: "Sci-Fi",
    duration: "2h 46m",
    rating: "8.9",
    platform: "Max",
    platformDot: "bg-[#3B9EFF]",
    quote: "“A staggering cinematic spectacle of prophecy and power.”",
    poster: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
  },
  {
    title: "Anatomy of a Fall",
    year: "2023",
    genre: "Thriller/Drama",
    duration: "2h 31m",
    rating: "8.8",
    platform: "Hulu",
    platformDot: "bg-[#22C55E]",
    quote: "“Ruthlessly gripping dissection of truth and domestic intimacy.”",
    poster: "https://image.tmdb.org/t/p/w500/1ho0d4LNZw3Y0voeKmSvPSgJOJ2.jpg",
  },
  {
    title: "The Zone of Interest",
    year: "2023",
    genre: "Drama/History",
    duration: "1h 45m",
    rating: "8.7",
    platform: "Max",
    platformDot: "bg-[#3B9EFF]",
    quote: "“Chilling, unforgettable sound design and structural precision.”",
    poster: "https://image.tmdb.org/t/p/w500/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg",
  },
  {
    title: "Past Lives",
    year: "2023",
    genre: "Romance/Drama",
    duration: "1h 46m",
    rating: "8.9",
    platform: "Netflix",
    platformDot: "bg-[#F43F5E]",
    quote: "“A bittersweet, tender portrait of destiny and quiet longing.”",
    poster: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
  },
];

export function LandingView() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [claimUsername, setClaimUsername] = useState("");
  const [copiedProfile, setCopiedProfile] = useState(false);
  const [copiedShareList, setCopiedShareList] = useState(false);
  const [addedVault, setAddedVault] = useState<Record<string, boolean>>({});

  const handleCopyShareList = () => {
    const text =
      `This Week's CineTrack Highlights:\n` +
      HIGHLIGHT_MOVIES.map(
        (m, idx) => `${idx + 1}. ${m.title} (${m.year}) ★ ${m.rating} [${m.platform}] - ${m.quote}`
      ).join("\n") +
      `\n\nMore at cinetrack.app`;

    navigator.clipboard.writeText(text);
    setCopiedShareList(true);
    setTimeout(() => setCopiedShareList(false), 2500);
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText("https://cinetrack.app/@rifat");
    setCopiedProfile(true);
    setTimeout(() => setCopiedProfile(false), 2500);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimUsername.trim()) {
      router.push(`/login?username=${encodeURIComponent(claimUsername.trim())}`);
    } else {
      router.push("/login");
    }
  };

  const toggleVault = (title: string) => {
    setAddedVault((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0F141D] text-[#F5F7FA] selection:bg-[#3B9EFF]/30 selection:text-white antialiased">
      {/* 0. FIXED TOP NAVIGATION BAR */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#151C27]/95 backdrop-blur-md border-b border-white/[0.06]">
        <div className="h-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <LogoIcon className="w-8 h-8" size={32} priority />
              <span className="font-bold text-lg text-white tracking-tight group-hover:text-[#3B9EFF] transition-colors">
                CineTrack
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#A8B0BD]">
              <a href="#demo-section" className="hover:text-white transition-colors">
                Trending
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#curator-profile" className="hover:text-white transition-colors">
                Curator Identity
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block h-6 w-[1px] bg-white/[0.08]" />
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-semibold text-[#A8B0BD] hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-xs rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center"
            >
              Get Started
            </Link>
          </div>
        </div>
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
            {/* Main CineTrack Headline (Option 1) */}
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[54px] xl:text-6xl font-black tracking-tight text-white leading-[1.12] mb-3 sm:mb-4 drop-shadow-md text-center">
              <span className="sm:whitespace-nowrap">Track what you watch.</span>{" "}
              <br className="hidden sm:inline" />
              <span className="text-[#3B9EFF] sm:whitespace-nowrap">
                Recommend what they&apos;ll love.
              </span>
            </h1>

            {/* Subtitle (Option 1) */}
            <p className="text-sm sm:text-lg text-[#CBD5E1] max-w-2xl mx-auto mb-6 sm:mb-8 font-normal leading-relaxed drop-shadow">
              CineTrack organizes every movie, series, and anime you&apos;ve ever experienced. When friends ask for a recommendation, send tailored picks by vibe or share your profile link instantly.
            </p>

            {/* Dual Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto h-12 sm:h-13 px-7 sm:px-8 bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#3B9EFF]/25 transition-all active:scale-95 cursor-pointer"
              >
                <span>Get Started</span>
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
          </div>

          {/* Netflix Signature Curved Bottom Arch Separator */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[140%] h-24 rounded-[100%] border-t-2 border-[#3B9EFF]/30 bg-gradient-to-b from-[#3B9EFF]/5 to-transparent pointer-events-none" />
        </section>

        {/* 2. "HOW IT WORKS IN 3 SIMPLE STEPS" */}
        <section id="how-it-works" className="w-full bg-[#171C25] py-16 lg:py-20 border-y border-white/[0.06]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-3">
              <div>
                <div className="text-[#3B9EFF] text-[11px] font-bold tracking-wider uppercase mb-1">
                  Architecture
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
                  How It Works in 3 Simple Steps
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#A8B0BD] max-w-md leading-relaxed">
                Built for film lovers who take pride in their watchlists and want zero friction
                when recommending to others.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 01 */}
              <div className="bg-[#1D2734] rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-white/[0.06]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-[#F5F7FA]">1. Log What You Watch</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1B2029] text-[#A8B0BD]">
                      01
                    </span>
                  </div>
                  <p className="text-xs text-[#A8B0BD] mb-5 leading-relaxed">
                    Rate titles 1–10, tag by emotional vibe (Hilarious, Mind-Bending, Cozy), and
                    jot 1-line spoiler-free curator notes.
                  </p>
                </div>

                {/* Mini Mock Log */}
                <div className="bg-[#090E17] p-3.5 rounded-lg border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#F5F7FA] truncate">
                      Superbad (2007)
                    </span>
                    <span className="text-xs font-bold text-[#F5C84B] flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#F5C84B]" />
                      <span>8.8</span>
                    </span>
                  </div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded bg-[#1B2029] text-[10px] font-semibold text-[#3B9EFF] mb-1.5">
                    😂 Hilarious &amp; Feel-Good
                  </div>
                  <p className="text-[11px] text-[#A8B0BD] italic">
                    &ldquo;Funniest high-school chaos ever written.&rdquo;
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="bg-[#1D2734] rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-white/[0.06]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-[#F5F7FA]">2. Friend Asks for a Pick</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1B2029] text-[#A8B0BD]">
                      02
                    </span>
                  </div>
                  <p className="text-xs text-[#A8B0BD] mb-5 leading-relaxed">
                    Friend asks: &ldquo;Got any funny movie for tonight?&rdquo; Filter your catalog
                    by vibe &amp; their streaming apps in 2 clicks.
                  </p>
                </div>

                {/* Mini Mock Vibe Toggle */}
                <div className="bg-[#090E17] p-3.5 rounded-lg border border-white/[0.06]">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#6F7886] mb-2 uppercase tracking-wide">
                    <span>Filter Query</span>
                    <span className="text-[#22C55E]">4 Matched</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="inline-flex items-center gap-1 bg-[#3B9EFF]/20 text-[#3B9EFF] px-2 py-0.5 rounded text-[11px] font-semibold">
                      <span>😂</span>
                      <span>Hilarious</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#1B2029] text-[#A8B0BD] px-2 py-0.5 rounded text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E]" />
                      <span>Netflix</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6F7886] flex items-center gap-1 font-medium">
                    <Zap className="w-3 h-3 text-[#F5C84B]" />
                    <span>Ready to dispatch instantly</span>
                  </div>
                </div>
              </div>

              {/* Step 03 */}
              <div className="bg-[#1D2734] rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-white/[0.06]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-[#F5F7FA]">3. Share Instantly</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1B2029] text-[#A8B0BD]">
                      03
                    </span>
                  </div>
                  <p className="text-xs text-[#A8B0BD] mb-5 leading-relaxed">
                    Copy a formatted text bundle directly into WhatsApp/iMessage, or send your
                    clean public profile link{" "}
                    <code className="text-[#3B9EFF] font-mono text-[11px]">cinetrack.app/@you</code>.
                  </p>
                </div>

                {/* Mini Mock Message Preview */}
                <div className="bg-[#090E17] p-3.5 rounded-lg border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#6F7886] mb-1.5 uppercase">
                    <Send className="w-3 h-3 text-[#22C55E]" />
                    <span>WhatsApp Preview</span>
                  </div>
                  <div className="bg-[#1A2330] p-2.5 rounded text-[11px] text-[#A8B0BD] leading-snug">
                    <p className="text-[#F5F7FA] font-bold mb-1">
                      Hey! 3 funny movie picks from my CineTrack:
                    </p>
                    <p className="truncate">1. Superbad (★ 8.8) • Netflix</p>
                    <p className="truncate">2. What We Do in the Shadows (★ 8.8)...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE "TRY THE RECOMMENDER" / THIS WEEK'S HIGHLIGHTS */}
        <section
          id="demo-section"
          className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-20"
        >
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

          {/* Filter Category Chips */}
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
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#3B9EFF] text-white"
                      : "bg-[#1A2330] hover:bg-[#1D2734] text-[#A8B0BD] hover:text-[#F5F7FA] border border-white/[0.06]"
                  }`}
                >
                  {tab.dot && <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />}
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 4 Featured Movie Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-5 mb-8">
            {HIGHLIGHT_MOVIES.map((movie) => {
              const isAdded = addedVault[movie.title];
              return (
                <div
                  key={movie.title}
                  className="flex flex-col bg-[#1D2734] rounded-xl overflow-hidden shadow-md group hover:-translate-y-1 transition-transform border border-white/[0.06]"
                >
                  {/* Poster Area */}
                  <div className="relative w-full aspect-[2/3] bg-[#1B2029] overflow-hidden">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded bg-[#0F141D]/85 backdrop-blur text-[9px] sm:text-[10px] font-bold text-[#F5F7FA] flex items-center gap-1 border border-white/[0.06]">
                      <span className={`w-1.5 h-1.5 rounded-full ${movie.platformDot}`} />
                      <span>{movie.platform}</span>
                    </div>
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded bg-[#0F141D]/85 backdrop-blur text-[10px] sm:text-[11px] font-bold text-[#F5C84B] flex items-center gap-0.5 border border-white/[0.06]">
                      <Star className="w-3 h-3 fill-[#F5C84B]" />
                      <span>{movie.rating}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between bg-[#1D2734]">
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#F5F7FA] truncate">
                        {movie.title}
                      </h3>
                      <div className="text-[10px] sm:text-[11px] text-[#6F7886] mb-1.5 font-medium truncate">
                        {movie.year} • {movie.genre} • {movie.duration}
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-[#A8B0BD] italic border-l-2 border-[#3B9EFF]/40 pl-2 leading-snug mb-2.5 line-clamp-2">
                        {movie.quote}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 pt-2 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => toggleVault(movie.title)}
                        className={`flex-1 h-7 sm:h-8 text-[10px] sm:text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          isAdded
                            ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"
                            : "bg-[#1A2330] hover:bg-[#253244] text-[#F5F7FA] border border-white/[0.06]"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>Vaulted</span>
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#3B9EFF]" />
                            <span>Vault</span>
                          </>
                        )}
                      </button>
                      <Link
                        href="/login"
                        className="h-7 sm:h-8 px-2 sm:px-2.5 bg-[#1A2330] hover:bg-[#253244] text-[#F5C84B] font-semibold text-[10px] sm:text-[11px] rounded flex items-center justify-center gap-0.5 transition-colors border border-white/[0.06]"
                        title="Rate this movie"
                      >
                        <Star className="w-3 h-3 fill-[#F5C84B]" />
                        <span>Rate</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-3.5 bg-[#1B2029] rounded-xl shadow-sm border border-white/[0.06]">
            <Link
              href="/search"
              className="w-full sm:w-auto h-10 px-5 bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Explore Full Weekly Top 50</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyShareList}
              className="w-full sm:w-auto h-10 px-5 bg-[#1A2330] hover:bg-[#1D2734] text-[#F5F7FA] font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-white/[0.08] cursor-pointer"
            >
              {copiedShareList ? (
                <>
                  <Check className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-[#22C55E]">List Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-[#3B9EFF]" />
                  <span>Share This Week&apos;s List</span>
                </>
              )}
            </button>
          </div>
        </section>



        {/* 4. THE SHAREABLE CURATOR PROFILE PREVIEW */}
        <section
          id="curator-profile"
          className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="text-[#3B9EFF] text-[11px] font-bold tracking-widest uppercase">
                Identity &amp; Taste
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA] leading-tight">
                Your Public Curator Identity <br />
                <span className="text-[#3B9EFF] font-mono text-xl sm:text-2xl font-normal">
                  cinetrack.app/@yourname
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
            </div>

            {/* Right Column: Clean Preview Card */}
            <div className="lg:col-span-6">
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
                        cinetrack.app/@rifat
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
                    <span className="font-mono text-[11px]">cinetrack.app/@rifat/recommend</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyProfileLink}
                    className="text-xs font-bold text-[#3B9EFF] hover:text-[#5AAFFF] cursor-pointer shrink-0 ml-2"
                  >
                    {copiedProfile ? "Copied!" : "Open"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. BOTTOM MINIMAL CALL-TO-ACTION */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-16 lg:py-24 border-t border-white/[0.06]">
          <div className="bg-[#1D2734] rounded-2xl p-8 sm:p-12 md:p-16 flex flex-col items-center text-center shadow-xl border border-white/[0.08] relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-[#1A2330] flex items-center justify-center text-[#3B9EFF] mb-4 shadow-sm border border-white/[0.06]">
              <Film className="w-6 h-6" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA] mb-2 max-w-xl">
              Ready to stop forgetting what you watched?
            </h2>
            <p className="text-xs sm:text-sm text-[#A8B0BD] max-w-lg mb-8 leading-relaxed">
              Build your vault in minutes. Free forever. No ads. Full data export anytime.
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
                className="h-11 px-6 bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-bold text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-[#3B9EFF]/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <span>Claim Your Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Discreet Status & Privacy Notes */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-[#6F7886] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                Instant Setup
              </span>
              <span>•</span>
              <span>Letterboxd / IMDb CSV Import Ready</span>
              <span>•</span>
              <span>No Credit Card Required</span>
            </div>
          </div>
        </section>
      </main>

      {/* 6. FOOTER */}
      <footer className="w-full bg-[#151C27] border-t border-white/[0.06] mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A8B0BD]">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <LogoIcon className="w-6 h-6" size={24} />
              <span className="font-bold text-sm text-[#F5F7FA] tracking-tight">CineTrack</span>
            </div>
            <span className="hidden sm:inline text-[#4B5563]">•</span>
            <span className="text-[12px] text-[#6F7886]">
              © {new Date().getFullYear()} CineTrack Systems. All rights reserved.
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-medium text-[#A8B0BD]">
            <a href="#demo-section" className="hover:text-white transition-colors">
              Trending
            </a>
            <Link href="/library" className="hover:text-white transition-colors">
              Library Matrices
            </Link>
            <Link href="/search" className="hover:text-white transition-colors">
              Editorial Archive
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
