"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Share2,
  Plus,
  Star,
  Clock,
  CheckCircle2,
  Film,
  Tv,
  Sparkles,
  Smile,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Copy,
  X,
  Flame,
  RotateCcw,
} from "lucide-react";
import { MediaCard } from "@/components/media/media-card";
import { QuickAddModal } from "@/components/quick-add/quick-add-modal";
import { NormalizedMedia } from "@/lib/media/normalize";

export interface LibraryItem {
  id: string;
  media: NormalizedMedia;
  status: "watching" | "completed" | "plan_to_watch" | "on_hold" | "dropped";
  userRating?: number | null;
  userEpisodes?: number;
  reviewText?: string | null;
  updatedAt?: string | null;
}

interface LibraryViewProps {
  initialItems: LibraryItem[];
  user: {
    id?: string;
    username?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  stats: {
    total: number;
    movies: number;
    series: number;
    anime: number;
    watching: number;
    completed: number;
    avgRating: number;
    totalMinutes: number;
  };
  initialStatus?: string;
  initialType?: string;
}

const GENRES = [
  "All",
  "Comedy",
  "Action",
  "Sci-Fi",
  "Drama",
  "Thriller",
  "Animation",
  "Romance",
  "Mystery",
  "Crime",
  "Horror",
  "Fantasy",
];

const SORT_OPTIONS = [
  { id: "highest_rated", label: "Highest Rated (Best First)" },
  { id: "recently_updated", label: "Recently Updated" },
  { id: "release_year", label: "Release Year (Newest)" },
  { id: "title", label: "Title (A–Z)" },
];

export function LibraryView({
  initialItems,
  user,
  stats,
  initialStatus = "all",
  initialType = "all",
}: LibraryViewProps) {
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("highest_rated");
  const [isCopied, setIsCopied] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const days = Math.floor(stats.totalMinutes / (60 * 24));
  const hours = Math.floor((stats.totalMinutes % (60 * 24)) / 60);

  // Filter & Sort Logic
  const filteredItems = useMemo(() => {
    return initialItems
      .filter((item) => {
        // Status filter
        if (statusFilter !== "all" && item.status !== statusFilter) return false;

        // Media type filter
        if (typeFilter !== "all" && item.media.mediaType !== typeFilter) return false;

        // Genre filter
        if (selectedGenre !== "All") {
          const itemGenres = item.media.genres || [];
          const hasGenre = itemGenres.some(
            (g) => g.toLowerCase() === selectedGenre.toLowerCase()
          );
          if (!hasGenre) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.media.title.toLowerCase().includes(q);
          const matchGenre = (item.media.genres || []).some((g) =>
            g.toLowerCase().includes(q)
          );
          if (!matchTitle && !matchGenre) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "highest_rated") {
          const rA = a.userRating || a.media.rating || 0;
          const rB = b.userRating || b.media.rating || 0;
          return rB - rA;
        }
        if (sortBy === "release_year") {
          const yA = parseInt(a.media.year || "0", 10);
          const yB = parseInt(b.media.year || "0", 10);
          return yB - yA;
        }
        if (sortBy === "title") {
          return a.media.title.localeCompare(b.media.title);
        }
        // recently_updated default
        return (
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
        );
      });
  }, [initialItems, statusFilter, typeFilter, selectedGenre, searchQuery, sortBy]);

  // Copy Profile URL or trigger Web Share
  const handleShareProfile = async () => {
    const profileUrl = typeof window !== "undefined"
      ? `${window.location.origin}/${user?.username ? `u/${user.username}` : "library"}`
      : "https://cinetrack.app";

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.username || "My"} CineTrack Library`,
          text: `Check out what I've been watching and my top rated recommendations on CineTrack!`,
          url: profileUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = profileUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // Quick preset shortcuts for friend recommendation use cases
  const applyPreset = (type: string, genre: string) => {
    setTypeFilter(type);
    setSelectedGenre(genre);
    setStatusFilter("completed");
    setSortBy("highest_rated");
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    selectedGenre !== "All" ||
    searchQuery.trim() !== "";

  const resetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setSelectedGenre("All");
    setSearchQuery("");
    setSortBy("highest_rated");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Identity & Actions Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#151C27] border border-white/[0.08] shadow-xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#3B9EFF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* User Identity Info */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#3B9EFF] to-blue-700 p-0.5 shrink-0 shadow-lg flex items-center justify-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#0F141D] flex items-center justify-center text-lg sm:text-xl font-bold text-white uppercase">
                {user?.username ? user.username[0] : "C"}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight truncate">
                {user?.username ? `@${user.username}` : "Personal Media Vault"}
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#A8B0BD] mt-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span>{stats.total} Total Titles Tracked</span>
              <span className="w-1 h-1 rounded-full bg-white/20 hidden xs:inline-block" />
              <span>{stats.completed} Completed</span>
              <span className="w-1 h-1 rounded-full bg-white/20 hidden xs:inline-block" />
              <span>{days}d {hours}h Watch Time</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Share Profile & Add Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap relative z-10 self-start md:self-auto">
          <button
            type="button"
            onClick={handleShareProfile}
            className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all active:scale-95 cursor-pointer border ${
              isCopied
                ? "bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]"
                : "bg-[#1D2734] hover:bg-[#253244] border-white/[0.08] text-[#F5F7FA]"
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#3B9EFF]" />
                <span>Share Profile</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-[#3B9EFF]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar (Desktop 4-col, Mobile 2-col) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3B9EFF]/15 text-[#3B9EFF] flex items-center justify-center shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-bold text-[#F5F7FA] leading-none">
              {stats.movies}
            </div>
            <div className="text-[11px] font-medium text-[#A8B0BD] mt-1">
              Feature Films
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#A855F7]/15 text-[#A855F7] flex items-center justify-center shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-bold text-[#F5F7FA] leading-none">
              {stats.series + stats.anime}
            </div>
            <div className="text-[11px] font-medium text-[#A8B0BD] mt-1">
              Series &amp; Anime
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F5C84B]/15 text-[#F5C84B] flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-[#F5C84B]" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-bold text-[#F5F7FA] leading-none">
              ★ {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "8.2"}
            </div>
            <div className="text-[11px] font-medium text-[#A8B0BD] mt-1">
              Mean Rating
            </div>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-bold text-[#F5F7FA] leading-none">
              {stats.total > 0
                ? `${Math.round((stats.completed / stats.total) * 100)}%`
                : "78%"}
            </div>
            <div className="text-[11px] font-medium text-[#A8B0BD] mt-1">
              Completion Rate
            </div>
          </div>
        </div>
      </div>

      {/* 3. Friend Recommendation Quick-Finder Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#172233] via-[#151C27] to-[#151C27] border border-[#3B9EFF]/20 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3B9EFF]/20 text-[#3B9EFF] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#F5F7FA]">
              Recommending to a friend?
            </h3>
            <p className="text-[11px] text-[#A8B0BD]">
              Pick a mood or genre below to find your highest-rated titles instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset("movie", "Comedy")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1D2734] hover:bg-[#2A374A] text-[#F5C84B] border border-white/[0.08] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Funny Movies</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset("all", "Sci-Fi")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1D2734] hover:bg-[#2A374A] text-[#3B9EFF] border border-white/[0.08] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mind-Bending Sci-Fi</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset("anime", "All")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1D2734] hover:bg-[#2A374A] text-[#A855F7] border border-white/[0.08] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Top Anime</span>
          </button>
        </div>
      </div>

      {/* 4. Controls: Status Tabs, Search & Filters */}
      <div className="flex flex-col gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: `All (${initialItems.length})` },
            { id: "watching", label: `Watching (${stats.watching})` },
            { id: "completed", label: `Completed (${stats.completed})` },
            { id: "plan_to_watch", label: "Plan to Watch" },
            { id: "on_hold", label: "On Hold" },
            { id: "dropped", label: "Dropped" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer select-none focus:outline-none focus-visible:outline-none border ${
                  isActive
                    ? "bg-[#3B9EFF] text-white border-[#3B9EFF] shadow-sm shadow-[#3B9EFF]/20"
                    : "bg-[#151C27] text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-[#1A2330] border-white/[0.06] hover:border-white/[0.14]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Toolbar: Search, Type Tabs, Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Instant Client Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6F7886] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or genre..."
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-[#151C27] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#6F7886] focus:outline-none focus:border-[#3B9EFF] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6F7886] hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Media Format Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Formats" },
              { id: "movie", label: "Movies" },
              { id: "series", label: "TV Shows" },
              { id: "anime", label: "Anime" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id)}
                className={`h-9 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer border select-none focus:outline-none focus-visible:outline-none ${
                  typeFilter === t.id
                    ? "bg-[#3B9EFF]/20 border-[#3B9EFF] text-[#3B9EFF]"
                    : "bg-[#151C27] border-white/[0.06] text-[#A8B0BD] hover:text-white hover:bg-[#1A2330] hover:border-white/[0.14]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="relative w-full sm:w-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort library titles"
              className="w-full sm:w-auto h-9 pl-3 pr-8 rounded-lg bg-[#151C27] border border-white/[0.08] text-xs text-[#F5F7FA] focus:outline-none focus:border-[#3B9EFF] cursor-pointer appearance-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#151C27] text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6F7886] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Quick Genre Pills (Especially Comedy for funny movie requests) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886] mr-1 shrink-0">
            Genre:
          </span>
          {GENRES.map((g) => {
            const isSelected = selectedGenre === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGenre(g)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 active:scale-95 cursor-pointer border select-none focus:outline-none focus-visible:outline-none ${
                  isSelected
                    ? "bg-[#3B9EFF] text-white font-semibold border-[#3B9EFF] shadow-sm shadow-[#3B9EFF]/20"
                    : "bg-[#151C27] text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-[#1A2330] border-white/[0.06] hover:border-white/[0.14]"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Active Filter Bar (when any filter is active) */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-[#A8B0BD] pt-1 border-t border-white/[0.04]">
            <span className="text-[11px]">
              Showing <strong className="text-[#F5F7FA]">{filteredItems.length}</strong> of {initialItems.length} titles
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] font-semibold text-[#3B9EFF] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Responsive Media Grid (Full-Width Responsive Cells) */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredItems.map((item) => (
            <MediaCard
              key={item.id}
              media={item.media}
              status={item.status}
              userRating={item.userRating || undefined}
              userEpisodes={item.userEpisodes}
              className="w-full"
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#151C27] border border-white/[0.06] my-6">
          <div className="w-12 h-12 rounded-full bg-[#1D2734] flex items-center justify-center text-[#6F7886] mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#F5F7FA]">No titles match your filters</h3>
          <p className="text-xs text-[#A8B0BD] max-w-sm mt-1 mb-4 leading-relaxed">
            Try adjusting your search query, switching format tabs, or clearing genre filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-[#1D2734] hover:bg-[#253244] text-[#F5F7FA] text-xs font-semibold border border-white/[0.08] transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        media={{
          id: "tmdb:movie:872585",
          source: "tmdb",
          sourceId: "872585",
          mediaType: "movie",
          title: "Oppenheimer",
          year: "2023",
          rating: 8.9,
          totalEpisodes: 1,
          posterPath: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
          backdropPath: null,
          genres: ["Drama", "History"],
        }}
      />
    </div>
  );
}
