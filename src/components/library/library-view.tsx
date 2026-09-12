"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Star,
  Clock,
  CheckCircle2,
  Film,
  Tv,
  Crown,
  Flame,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronDown,
  Check,
  Copy,
  Pencil,
  X,
  RotateCcw,
} from "lucide-react";
import { MediaCard } from "@/components/media/media-card";
import { QuickAddModal } from "@/components/quick-add/quick-add-modal";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { NormalizedMedia } from "@/lib/media/normalize";
import { RatingCategory, getRatingRank, RATING_CONFIG } from "@/lib/rating";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { SeasonInfo } from "@/app/api/tv/[id]/seasons/route";

export interface LibraryItem {
  id: string;
  media: NormalizedMedia;
  status: "watching" | "completed" | "plan_to_watch" | "on_hold" | "dropped";
  userRating?: RatingCategory | string | number | null;
  userEpisodes?: number;
  currentSeason?: number;
  currentEpisode?: number;
  seasons?: SeasonInfo[];
  reviewText?: string | null;
  containsSpoilers?: boolean;
  fromUsername?: string;
  updatedAt?: string | null;
}

interface LibraryViewProps {
  initialItems: LibraryItem[];
  user: {
    id?: string;
    username?: string | null;
    displayName?: string | null;
    fullName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    backdropUrl?: string | null;
    bio?: string | null;
    createdAt?: string | Date | null;
  } | null;
  stats: {
    total: number;
    movies: number;
    series: number;
    anime: number;
    watching: number;
    completed: number;
    avgRating?: number;
    totalMinutes: number;
  };
  initialStatus?: string;
  initialType?: string;
  isOwner?: boolean;
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
  { id: "recently_updated", label: "Recently Updated" },
  { id: "masterpiece_first", label: "My Rating (Masterpiece First)" },
  { id: "good_first", label: "My Rating (Good First)" },
  { id: "poor_first", label: "My Rating (Poor First)" },
  { id: "release_year", label: "Release Year (Newest)" },
  { id: "title", label: "Title (A–Z)" },
];


export function LibraryView({
  initialItems,
  user,
  stats,
  initialStatus = "all",
  initialType = "all",
  isOwner = true,
}: LibraryViewProps) {
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recently_updated");
  const [isUsernameCopied, setIsUsernameCopied] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [currentUserState, setCurrentUserState] = useState(user);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setCurrentUserState(user);
    setAvatarError(false);
  }, [user]);

  const getInitials = (name?: string | null, username?: string | null) => {
    const target = (name || username || "").trim();
    if (!target) return "C";
    const parts = target.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return target.slice(0, 2).toUpperCase();
  };

  // Compute dynamic taste counts across all library items
  const tasteCounts = useMemo(() => {
    return {
      masterpiece: initialItems.filter((i) => i.userRating === "masterpiece").length,
      good: initialItems.filter((i) => i.userRating === "good").length,
      average: initialItems.filter((i) => i.userRating === "average").length,
      poor: initialItems.filter((i) => i.userRating === "poor").length,
      unrated: initialItems.filter((i) => !i.userRating).length,
    };
  }, [initialItems]);

  const statusOptions = useMemo<DropdownOption[]>(() => [
    { id: "all", label: "All", count: initialItems.length },
    { id: "watching", label: "Watching", count: stats.watching, dot: "bg-[#3B9EFF] shadow-[0_0_8px_rgba(59,158,255,0.7)]" },
    { id: "completed", label: "Completed", count: stats.completed, dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" },
    { id: "plan_to_watch", label: "Plan to Watch", dot: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.7)]" },
    { id: "on_hold", label: "On Hold", dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" },
    { id: "dropped", label: "Dropped", dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.7)]" },
  ], [initialItems.length, stats.watching, stats.completed]);

  const formatOptions = useMemo<DropdownOption[]>(() => [
    { id: "all", label: "All Formats" },
    { id: "movie", label: "Movies", icon: <Film className="w-3.5 h-3.5" /> },
    { id: "series", label: "TV Shows", icon: <Tv className="w-3.5 h-3.5" /> },
    { id: "anime", label: "Anime", icon: <Flame className="w-3.5 h-3.5" /> },
  ], []);

  const ratingOptions = useMemo<DropdownOption[]>(() => [
    { id: "all", label: "All Ratings", count: initialItems.length },
    { id: "masterpiece", label: "Masterpiece", dot: "bg-[#F5C84B] shadow-[0_0_8px_rgba(245,200,75,0.7)]", count: tasteCounts.masterpiece, color: "text-[#F5C84B]" },
    { id: "good", label: "Good", dot: "bg-[#3B9EFF] shadow-[0_0_8px_rgba(59,158,255,0.7)]", count: tasteCounts.good, color: "text-[#3B9EFF]" },
    { id: "average", label: "Average", dot: "bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.7)]", count: tasteCounts.average, color: "text-[#F59E0B]" },
    { id: "poor", label: "Poor", dot: "bg-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.7)]", count: tasteCounts.poor, color: "text-[#F43F5E]" },
    { id: "not_rated", label: "Not Rated", dot: "bg-white/30", count: tasteCounts.unrated },
  ], [initialItems.length, tasteCounts]);

  const genreOptions = useMemo<DropdownOption[]>(() => [
    { id: "All", label: "All Genres" },
    ...GENRES.filter((g) => g !== "All").map((g) => ({ id: g, label: g })),
  ], []);

  const sortOptions = useMemo<DropdownOption[]>(() => 
    SORT_OPTIONS.map((opt) => ({
      id: opt.id,
      label: opt.label,
    })),
  []);

  const selectedStatusOpt = statusOptions.find((o) => o.id === statusFilter) || statusOptions[0];
  const statusTriggerLabel = selectedStatusOpt.count !== undefined
    ? `${selectedStatusOpt.label} (${selectedStatusOpt.count})`
    : selectedStatusOpt.label;

  const selectedRatingOpt = ratingOptions.find((o) => o.id === ratingFilter) || ratingOptions[0];
  const ratingTriggerLabel =
    ratingFilter === "all"
      ? "Rating"
      : selectedRatingOpt.count !== undefined
      ? `${selectedRatingOpt.label} (${selectedRatingOpt.count})`
      : selectedRatingOpt.label;

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

        // Personal Rating Category filter
        if (ratingFilter !== "all") {
          if (ratingFilter === "not_rated") {
            if (item.userRating !== null && item.userRating !== undefined) return false;
          } else {
            if (item.userRating !== ratingFilter) return false;
          }
        }

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
        if (sortBy === "masterpiece_first") {
          const rA = getRatingRank(a.userRating);
          const rB = getRatingRank(b.userRating);
          if (rB !== rA) return rB - rA;
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
        }
        if (sortBy === "good_first") {
          // Items marked 'good' first, then masterpiece, average, poor
          const rankGood = (r: unknown) => (r === "good" ? 10 : getRatingRank(r));
          const rA = rankGood(a.userRating);
          const rB = rankGood(b.userRating);
          if (rB !== rA) return rB - rA;
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
        }
        if (sortBy === "poor_first") {
          // Only rated items first, ascending from poor to masterpiece
          const rA = a.userRating ? getRatingRank(a.userRating) : 999;
          const rB = b.userRating ? getRatingRank(b.userRating) : 999;
          if (rA !== rB) return rA - rB;
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
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
  }, [
    initialItems,
    statusFilter,
    typeFilter,
    ratingFilter,
    selectedGenre,
    searchQuery,
    sortBy,
  ]);

  // Quick Copy @username Link
  const handleCopyUsernameLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}/${currentUserState?.username || "library"}`
        : "https://cinetrack.app";

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setIsUsernameCopied(true);
      setTimeout(() => setIsUsernameCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy username link:", err);
    }
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    typeFilter !== "all" ||
    ratingFilter !== "all" ||
    selectedGenre !== "All" ||
    searchQuery.trim() !== "";

  const resetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setRatingFilter("all");
    setSelectedGenre("All");
    setSearchQuery("");
    setSortBy("recently_updated");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Prestigious Vertical Profile Hero Card */}
      <div className="rounded-3xl bg-[#151C27] border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col">
        {/* Cover Movie Poster / Backdrop Banner */}
        <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden bg-[#0F172A] group/cover">
          <img
            src={
              currentUserState?.backdropUrl ||
              "https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg"
            }
            alt="Profile Cover Poster"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover/cover:scale-105"
          />
          {/* Subtle gradient scrim at bottom to transition smoothly into the card body */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151C27] via-[#151C27]/40 to-transparent pointer-events-none" />

          {/* Top-Right Owner Action: Edit Cover */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute top-3.5 right-3.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-medium inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-lg z-10"
              title="Change Movie Poster Cover"
            >
              <Pencil className="w-3 h-3 text-[#A8B0BD]" />
              <span>Edit Cover</span>
            </button>
          )}
        </div>

        {/* Card Body: Overlapping Avatar, Identity, Bio & Actions */}
        <div className="px-5 sm:px-8 pb-6 flex flex-col items-center text-center relative z-10">
          {/* Circular Overlapping Avatar */}
          <div className="relative -mt-14 sm:-mt-16 w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#151C27] sm:ring-[5px] bg-[#1A2332] shadow-2xl overflow-hidden flex items-center justify-center shrink-0 group">
            {currentUserState?.avatarUrl && !avatarError ? (
              <img
                src={currentUserState.avatarUrl}
                alt={currentUserState.displayName || currentUserState.username || "User"}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center text-xl sm:text-2xl font-black text-[#3B9EFF] tracking-wider uppercase select-none">
                {getInitials(currentUserState?.displayName, currentUserState?.username)}
              </div>
            )}

            {isOwner && (
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                title="Change Avatar"
              >
                <Pencil className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 1. Display Name */}
          <div className="flex items-center justify-center gap-2 mt-3.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F7FA] tracking-tight">
              {currentUserState?.displayName || currentUserState?.fullName || currentUserState?.username || "Personal Media Vault"}
            </h1>
          </div>

          {/* 2. Username Pill with Copy Functionality */}
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <button
              type="button"
              onClick={handleCopyUsernameLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D2734]/80 hover:bg-[#1D2734] border border-white/[0.08] hover:border-[#3B9EFF]/40 transition-all text-xs font-mono text-[#3B9EFF] group cursor-pointer active:scale-95"
              title="Click to copy profile link"
            >
              <span>@{currentUserState?.username || "user"}</span>
              {isUsernameCopied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-[#6F7886] group-hover:text-white transition-colors" />
              )}
            </button>
            {isUsernameCopied && (
              <span className="text-[11px] font-semibold text-emerald-400 animate-fade-in flex items-center gap-1">
                Copied!
              </span>
            )}
          </div>

          {/* 3. Bio */}
          {currentUserState?.bio ? (
            <p className="mt-3.5 text-xs sm:text-sm text-[#A8B0BD] leading-relaxed max-w-lg mx-auto text-center font-normal">
              {currentUserState.bio}
            </p>
          ) : isOwner ? (
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="mt-2 text-xs text-[#6F7886] hover:text-[#3B9EFF] italic inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>+ Add a bio (up to 160 characters)...</span>
            </button>
          ) : null}

          {/* 4. Action Buttons (Owner Only) */}
          {isOwner && (
            <div className="flex items-center justify-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="h-10 px-5 rounded-full bg-[#1D2734] hover:bg-[#253244] border border-white/[0.08] hover:border-white/[0.15] text-[#F5F7FA] text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-[#A8B0BD]" />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="h-10 px-6 rounded-full bg-[#3B9EFF] hover:bg-[#2F8EEA] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#3B9EFF]/25 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Media</span>
              </button>
            </div>
          )}

          {/* 5. 3-Column Stats Bar with Vertical Dividers */}
          <div className="w-full mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-3 divide-x divide-white/[0.08] text-center">
            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-xl sm:text-2xl font-black text-[#F5F7FA] tracking-tight">
                {stats.total}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6F7886] mt-0.5">
                Tracked
              </span>
            </div>

            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                {stats.completed}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6F7886] mt-0.5">
                Completed
              </span>
            </div>

            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-xl sm:text-2xl font-black text-[#3B9EFF] tracking-tight">
                {days}d {hours}h
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6F7886] mt-0.5">
                Watch Time
              </span>
            </div>
          </div>
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
            <Crown className="w-5 h-5 fill-[#F5C84B]/20" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-bold text-[#F5C84B] leading-none">
              {tasteCounts.masterpiece}
            </div>
            <div className="text-[11px] font-medium text-[#A8B0BD] mt-1">
              Masterpieces
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

      {/* Controls: Search, Status & Filter Dropdowns */}
      <div className="flex flex-col gap-2.5">
        {/* Unified Search & Dropdown Filters Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* Row 1 on Mobile: Status Dropdown + Search Input Inline */}
          <div className="flex items-center gap-2 flex-1">
            {/* Status Dropdown */}
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              triggerLabel={statusTriggerLabel}
              align="left"
              className="shrink-0 w-[125px] sm:w-[140px]"
              menuWidth="w-[185px]"
              ariaLabel="Filter by watch status"
            />

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
          </div>

          {/* 4 Compact Filter Dropdowns: 2x2 Grid on Mobile, 4 Columns on Tablet, Flex on Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2 w-full lg:w-auto shrink-0">
            {/* 1. Format */}
            <CustomDropdown
              value={typeFilter}
              onChange={setTypeFilter}
              options={formatOptions}
              align="left"
              className="w-full lg:w-auto lg:min-w-[125px]"
              menuWidth="w-[165px]"
              ariaLabel="Filter by format"
            />

            {/* 2. Rating */}
            <CustomDropdown
              value={ratingFilter}
              onChange={setRatingFilter}
              options={ratingOptions}
              triggerLabel={ratingTriggerLabel}
              align="right"
              className="w-full lg:w-auto lg:min-w-[140px]"
              menuWidth="w-[195px]"
              ariaLabel="Filter by personal rating"
            />

            {/* 3. Genre */}
            <CustomDropdown
              value={selectedGenre}
              onChange={setSelectedGenre}
              options={genreOptions}
              align="left"
              className="w-full lg:w-auto lg:min-w-[125px]"
              menuWidth="w-[170px]"
              ariaLabel="Filter by genre"
            />

            {/* 4. Sort */}
            <CustomDropdown
              value={sortBy}
              onChange={setSortBy}
              options={sortOptions}
              align="right"
              className="w-full lg:w-auto lg:min-w-[160px]"
              menuWidth="w-[230px]"
              suffixIcon="sort"
              ariaLabel="Sort library titles"
            />
          </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredItems.map((item) => (
            <MediaCard
              key={item.id}
              media={item.media}
              status={item.status}
              userRating={item.userRating || undefined}
              userEpisodes={item.userEpisodes}
              currentSeason={item.currentSeason}
              currentEpisode={item.currentEpisode}
              seasons={item.seasons}
              reviewText={item.reviewText}
              containsSpoilers={item.containsSpoilers}
              fromUsername={currentUserState?.username || undefined}
              readOnly={!isOwner}
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

      {/* Add to Library Modal */}
      {isOwner && (
        <QuickAddModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          media={null}
        />
      )}

      {/* Edit Profile Modal */}
      {isOwner && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          initialData={{
            displayName: currentUserState?.displayName || currentUserState?.fullName,
            username: currentUserState?.username,
            bio: currentUserState?.bio,
            avatarUrl: currentUserState?.avatarUrl,
            backdropUrl: currentUserState?.backdropUrl,
          }}
          onSuccess={(updated) => {
            setCurrentUserState((prev: any) => ({
              ...prev,
              displayName: updated.displayName,
              fullName: updated.displayName,
              username: updated.username || prev?.username,
              bio: updated.bio,
              avatarUrl: updated.avatarUrl || prev?.avatarUrl,
              backdropUrl: updated.backdropUrl !== undefined ? updated.backdropUrl : prev?.backdropUrl,
            }));
          }}
        />
      )}
    </div>
  );
}
