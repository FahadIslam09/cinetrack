"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  Film,
  Tv,
  Flame,
  Star,
  Check,
  CheckCircle2,
  Play,
  Bookmark,
  Clock,
  XCircle,
  Plus,
  Minus,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { upsertMediaLog } from "@/actions/tracking";
import { RatingCategory, RATING_CONFIG, parseRating } from "@/lib/rating";

export interface QuickAddModalProps {
  media?: NormalizedMedia | null;
  isOpen: boolean;
  onClose: () => void;
  initialLog?: {
    status?: string;
    rating?: RatingCategory | string | number | null;
    episodesWatched?: number;
    reviewText?: string | null;
    containsSpoilers?: boolean;
    isFavorite?: boolean;
  } | null;
  onSuccess?: () => void;
}

type WatchStatus = "watching" | "completed" | "plan_to_watch" | "on_hold" | "dropped";

const STATUS_CONFIG: Record<
  WatchStatus,
  { label: string; icon: typeof CheckCircle2; color: string; border: string; bg: string; text: string }
> = {
  watching: {
    label: "Watching",
    icon: Play,
    color: "#3B9EFF",
    border: "border-[#3B9EFF]/40",
    bg: "bg-[#3B9EFF]/15",
    text: "text-[#3B9EFF]",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "#22C55E",
    border: "border-[#22C55E]/40",
    bg: "bg-[#22C55E]/15",
    text: "text-[#22C55E]",
  },
  plan_to_watch: {
    label: "Want to Watch",
    icon: Bookmark,
    color: "#A855F7",
    border: "border-[#A855F7]/40",
    bg: "bg-[#A855F7]/15",
    text: "text-[#A855F7]",
  },
  on_hold: {
    label: "On Hold",
    icon: Clock,
    color: "#F59E0B",
    border: "border-[#F59E0B]/40",
    bg: "bg-[#F59E0B]/15",
    text: "text-[#F59E0B]",
  },
  dropped: {
    label: "Dropped",
    icon: XCircle,
    color: "#F43F5E",
    border: "border-[#F43F5E]/40",
    bg: "bg-[#F43F5E]/15",
    text: "text-[#F43F5E]",
  },
};

export function QuickAddModal({
  media,
  isOpen,
  onClose,
  initialLog,
  onSuccess,
}: QuickAddModalProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Step state: 1 = Search & Select, 2 = Set Watch Info, 3 = Summary & Add
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selected media state
  const [selectedMedia, setSelectedMedia] = useState<NormalizedMedia | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "movie" | "series" | "anime">("all");
  const [searchResults, setSearchResults] = useState<NormalizedMedia[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeSearchIdRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchTypeRef = useRef<"all" | "movie" | "series" | "anime">("all");

  // Watch info form state
  const [status, setStatus] = useState<WatchStatus>("watching");
  const [rating, setRating] = useState<RatingCategory | null>(null);
  const [episodes, setEpisodes] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lock background scroll when modal is open, restore cleanly when closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Initialize modal state on open or media change
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSaveSuccess(false);

      if (media) {
        // Pre-selected media (e.g. from card "+ Add") -> start directly at Step 2
        setSelectedMedia(media);
        setStep(2);
        setStatus(
          (initialLog?.status as WatchStatus) ||
            (media.mediaType === "movie" ? "completed" : "watching")
        );
        setRating(parseRating(initialLog?.rating));
        setEpisodes(initialLog?.episodesWatched || 0);
        setReview(initialLog?.reviewText || "");
        setContainsSpoilers(initialLog?.containsSpoilers || false);
      } else {
        // General "+ Add" click -> start at Step 1: Search & Select
        setSelectedMedia(null);
        setStep(1);
        setSearchQuery("");
        setSearchResults([]);
        setSearchType("all");
        searchTypeRef.current = "all";
        setIsSearching(false);
        setSearchError(null);
        setStatus("watching");
        setRating(null);
        setEpisodes(0);
        setReview("");
        setContainsSpoilers(false);

        // Auto-focus search input
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, media, initialLog]);

  // Keep searchTypeRef in sync
  useEffect(() => {
    searchTypeRef.current = searchType;
  }, [searchType]);

  // Immediate search execution helper
  const executeSearch = async (
    query: string,
    type: "all" | "movie" | "series" | "anime"
  ) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const searchId = ++activeSearchIdRef.current;
    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}&type=${type}`
      );
      if (searchId !== activeSearchIdRef.current) return;

      if (!res.ok) {
        throw new Error("Search service temporarily unavailable");
      }
      const data = await res.json();
      if (searchId !== activeSearchIdRef.current) return;

      setSearchResults(data.results || []);
    } catch (err: any) {
      if (searchId !== activeSearchIdRef.current) return;
      console.error("QuickAdd search error:", err);
      setSearchError(err.message || "Failed to search titles");
      setSearchResults([]);
    } finally {
      if (searchId === activeSearchIdRef.current) {
        setIsSearching(false);
      }
    }
  };

  // Debounced search on input typing
  useEffect(() => {
    if (!isOpen || step !== 1) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(searchQuery, searchTypeRef.current);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, isOpen, step]);

  // Handle format filter click immediately without 300ms debounce lag
  const handleFilterClick = (newType: "all" | "movie" | "series" | "anime") => {
    if (newType === searchType) return;
    setSearchType(newType);
    searchTypeRef.current = newType;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim()) {
      executeSearch(searchQuery, newType);
    }
  };

  if (!isOpen) return null;

  // Handle media selection from Step 1
  const handleSelectMedia = (selected: NormalizedMedia) => {
    setSelectedMedia(selected);
    setStatus(selected.mediaType === "movie" ? "completed" : "watching");
    setEpisodes(0);
    setRating(null);
    setReview("");
    setContainsSpoilers(false);
    setErrorMessage(null);
    setStep(2);
  };

  // Submit to library in Step 3
  const handleSave = async () => {
    if (!selectedMedia) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await upsertMediaLog({
        media: selectedMedia,
        status,
        rating,
        episodesWatched: episodes,
        reviewText: review,
        containsSpoilers,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
      } else {
        setSaveSuccess(true);
        setIsSubmitting(false);
        onSuccess?.();

        startTransition(() => {
          router.refresh();
        });

        // Close after brief success confirmation
        setTimeout(() => {
          onClose();
        }, 900);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save title to library.");
      setIsSubmitting(false);
    }
  };

  // Helper for format badge
  const renderFormatBadge = (type: string, className = "text-[10px]") => {
    if (type === "anime") {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F5C84B]/15 text-[#F5C84B] font-semibold uppercase tracking-wider ${className}`}>
          <Flame className="w-3 h-3" />
          <span>Anime</span>
        </span>
      );
    }
    if (type === "series") {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#3B9EFF]/15 text-[#3B9EFF] font-semibold uppercase tracking-wider ${className}`}>
          <Tv className="w-3 h-3" />
          <span>Series</span>
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[#F5F7FA] font-semibold uppercase tracking-wider ${className}`}>
        <Film className="w-3 h-3" />
        <span>Movie</span>
      </span>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-library-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-[#151C27] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[88dvh] sm:h-[620px] max-h-[92dvh] sm:max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Step Indicator */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-[#1A2330]/40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step > 1 && !media && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A8B0BD] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer mr-1"
                  aria-label="Previous step"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 id="add-to-library-title" className="text-base sm:text-lg font-bold text-[#F5F7FA]">
                Add to Library
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8B0BD] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Minimal Step Progress Indicator */}
          <div className="flex items-center justify-between w-full pt-0.5 px-0.5 select-none">
            {[
              { num: 1, label: "Select" },
              { num: 2, label: "Details" },
              { num: 3, label: "Summary" },
            ].map((s, idx) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              const canClick = isCompleted && !media;

              return (
                <div key={s.num} className="contents">
                  {/* Step Node */}
                  <div
                    onClick={() => canClick && setStep(s.num as 1 | 2)}
                    className={`flex items-center gap-1.5 shrink-0 transition-opacity ${
                      canClick ? "cursor-pointer hover:opacity-80" : "cursor-default"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shrink-0 ${
                        isCompleted
                          ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40"
                          : isCurrent
                          ? "bg-[#3B9EFF] text-white shadow-sm shadow-[#3B9EFF]/30 ring-2 ring-[#3B9EFF]/20"
                          : "bg-[#1D2734] text-[#6F7886] border border-white/[0.08]"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <span>{s.num}</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] tracking-tight whitespace-nowrap transition-colors ${
                        isCurrent
                          ? "text-[#F5F7FA] font-semibold"
                          : isCompleted
                          ? "text-[#A8B0BD] font-medium"
                          : "text-[#6F7886] font-medium"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>

                  {/* Connecting Line */}
                  {idx < 2 && (
                    <div className="flex-1 mx-2 sm:mx-3 h-[1.5px] rounded-full bg-white/[0.08] overflow-hidden min-w-[14px]">
                      <div
                        className={`h-full transition-all duration-300 ${
                          step > idx + 1
                            ? "w-full bg-[#22C55E]"
                            : step === idx + 2
                            ? "w-full bg-[#3B9EFF]"
                            : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto modal-scrollbar p-4 sm:p-5 flex flex-col min-h-0">
          {/* =========================================================================
              STEP 1: SEARCH & SELECT
             ========================================================================= */}
          {step === 1 && (
            <div className="flex flex-col gap-4 flex-1">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#6F7886] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movie, TV series, or anime title..."
                  className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#1D2734] border border-white/[0.08] text-sm text-[#F5F7FA] placeholder-[#6F7886] focus:outline-none focus:border-[#3B9EFF] focus:ring-2 focus:ring-[#3B9EFF]/20 transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7886] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Format Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: "All Formats" },
                  { id: "movie", label: "Movies", icon: Film },
                  { id: "series", label: "TV Shows", icon: Tv },
                  { id: "anime", label: "Anime", icon: Flame },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  const isActive = searchType === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => handleFilterClick(fmt.id as any)}
                      className={`h-7 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-150 whitespace-nowrap cursor-pointer shrink-0 border select-none outline-none focus:outline-none focus-visible:outline-none active:scale-95 ${
                        isActive
                          ? "bg-[#3B9EFF] text-white border-[#3B9EFF] shadow-sm shadow-[#3B9EFF]/25"
                          : "bg-[#1D2734] text-[#A8B0BD] hover:text-white hover:bg-[#253244] border-white/[0.06] hover:border-white/[0.14]"
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      <span>{fmt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Results / States */}
              <div className="flex-1 min-h-[320px] flex flex-col relative">
                {searchResults.length > 0 ? (
                  <div className="relative flex-1 flex flex-col min-h-0">
                    {/* In-place Loading Overlay when updating existing results */}
                    {isSearching && (
                      <div className="absolute inset-0 bg-[#151C27]/50 backdrop-blur-[1px] rounded-xl z-10 flex items-center justify-center pointer-events-none transition-all duration-150">
                        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#1D2734] border border-white/[0.1] shadow-xl text-xs font-semibold text-[#F5F7FA]">
                          <Loader2 className="w-4 h-4 text-[#3B9EFF] animate-spin" />
                          <span>Updating titles...</span>
                        </div>
                      </div>
                    )}

                    <div
                      className={`space-y-2 overflow-y-auto flex-1 modal-scrollbar pr-1 transition-opacity duration-150 ${
                        isSearching ? "opacity-35 pointer-events-none" : "opacity-100"
                      }`}
                    >
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectMedia(item)}
                          className="group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#1D2734]/70 hover:bg-[#1D2734] border border-white/[0.04] hover:border-[#3B9EFF]/40 transition-all cursor-pointer select-none active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.posterPath ? (
                              <img
                                src={item.posterPath}
                                alt={item.title}
                                className="w-11 h-16 rounded-lg object-cover bg-[#151C27] shrink-0 shadow-md"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-11 h-16 rounded-lg bg-[#151C27] shrink-0 flex items-center justify-center text-[#6F7886] border border-white/[0.04]">
                                {item.mediaType === "movie" ? (
                                  <Film className="w-5 h-5" />
                                ) : item.mediaType === "anime" ? (
                                  <Flame className="w-5 h-5" />
                                ) : (
                                  <Tv className="w-5 h-5" />
                                )}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-[#F5F7FA] group-hover:text-[#3B9EFF] transition-colors truncate">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                {renderFormatBadge(item.mediaType)}
                                {item.year && (
                                  <span className="text-xs text-[#A8B0BD]">
                                    {item.year}
                                  </span>
                                )}
                                {item.rating > 0 && (
                                  <span className="text-xs font-semibold text-[#F5C84B] flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-[#F5C84B]" />
                                    <span>{item.rating.toFixed(1)}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 pr-1">
                            <div className="w-8 h-8 rounded-full bg-white/[0.06] group-hover:bg-[#3B9EFF] text-[#A8B0BD] group-hover:text-white flex items-center justify-center transition-all">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : isSearching ? (
                  <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center gap-2.5 py-12 text-[#A8B0BD]">
                    <Loader2 className="w-7 h-7 text-[#3B9EFF] animate-spin" />
                    <p className="text-xs font-medium">Searching titles...</p>
                  </div>
                ) : searchError ? (
                  <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <p className="text-sm text-[#F43F5E]">{searchError}</p>
                    <button
                      type="button"
                      onClick={() => executeSearch(searchQuery, searchType)}
                      className="text-xs text-[#3B9EFF] hover:underline cursor-pointer"
                    >
                      Retry search
                    </button>
                  </div>
                ) : searchQuery.trim().length > 0 ? (
                  <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center gap-2 py-12 text-center text-[#A8B0BD]">
                    <Search className="w-8 h-8 text-[#6F7886]/60" />
                    <p className="text-sm font-medium text-[#F5F7FA]">
                      No titles found
                    </p>
                    <p className="text-xs text-[#6F7886] max-w-xs">
                      We couldn&apos;t find anything matching &ldquo;{searchQuery}&rdquo;. Try another spelling or switch formats.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center gap-3 py-12 text-center text-[#A8B0BD]">
                    <div className="w-12 h-12 rounded-2xl bg-[#1D2734] border border-white/[0.06] flex items-center justify-center text-[#3B9EFF]">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F5F7FA]">
                        Search CineTrack Catalog
                      </p>
                      <p className="text-xs text-[#6F7886] max-w-xs mt-1">
                        Type any movie, TV series, or anime above to add it to your watchlist.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: SET WATCH INFORMATION
             ========================================================================= */}
          {step === 2 && selectedMedia && (
            <div className="flex flex-col gap-5 flex-1">
              {/* Selected Media Mini Card */}
              <div className="p-3 rounded-xl bg-[#1D2734]/80 border border-white/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedMedia.posterPath ? (
                    <img
                      src={selectedMedia.posterPath}
                      alt={selectedMedia.title}
                      className="w-10 h-14 rounded-lg object-cover bg-[#151C27] shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-[#151C27] shrink-0 flex items-center justify-center text-[#6F7886]">
                      <Film className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {renderFormatBadge(selectedMedia.mediaType, "text-[9px]")}
                      {selectedMedia.year && (
                        <span className="text-[11px] text-[#A8B0BD]">
                          {selectedMedia.year}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-[#F5F7FA] truncate mt-0.5">
                      {selectedMedia.title}
                    </h3>
                  </div>
                </div>

                {!media && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-8 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-[#A8B0BD] hover:text-white transition-colors shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Watch Status Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8B0BD] mb-2">
                  Watch Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(STATUS_CONFIG) as WatchStatus[]).map((st) => {
                    const cfg = STATUS_CONFIG[st];
                    const Icon = cfg.icon;
                    const isActive = status === st;

                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        className={`h-10 px-3 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center gap-2 cursor-pointer active:scale-95 select-none outline-none focus:outline-none focus-visible:outline-none ${
                          isActive
                            ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-sm`
                            : "bg-[#1D2734] border-white/[0.06] text-[#A8B0BD] hover:text-white hover:bg-[#253244] hover:border-white/[0.14]"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{cfg.label}</span>
                        {isActive && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Episode Tracker (TV & Anime) */}
              {selectedMedia.mediaType !== "movie" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8B0BD] mb-2">
                    Episode Progress
                  </label>
                  <div className="flex items-center justify-between bg-[#1D2734] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-sm text-[#F5F7FA] font-medium">
                      {episodes} / {selectedMedia.totalEpisodes || "∞"} episodes watched
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEpisodes(Math.max(0, episodes - 1))}
                        disabled={episodes <= 0}
                        className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-30 flex items-center justify-center text-white transition-colors cursor-pointer"
                        aria-label="Decrease episode count"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEpisodes(
                            selectedMedia.totalEpisodes
                              ? Math.min(selectedMedia.totalEpisodes, episodes + 1)
                              : episodes + 1
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white transition-colors cursor-pointer"
                        aria-label="Increase episode count"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Rating Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#A8B0BD]">
                    Personal Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">
                      {rating ? (
                        <span className={RATING_CONFIG[rating].textColor}>
                          {RATING_CONFIG[rating].label}
                        </span>
                      ) : (
                        <span className="text-[#6F7886]">Unrated</span>
                      )}
                    </span>
                    {rating && (
                      <button
                        type="button"
                        onClick={() => setRating(null)}
                        className="text-[11px] text-[#6F7886] hover:text-[#F5F7FA] underline transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#1D2734] p-1.5 rounded-xl border border-white/[0.06]">
                  {(["poor", "average", "good", "masterpiece"] as const).map((catId) => {
                    const isSelected = rating === catId;
                    const def = RATING_CONFIG[catId];
                    return (
                      <button
                        key={catId}
                        type="button"
                        onClick={() => setRating(isSelected ? null : catId)}
                        className={`h-10 px-2.5 rounded-lg text-xs font-semibold border transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none ${
                          isSelected
                            ? `${def.activeBg} ${def.activeBorder} ${def.activeText} shadow-sm`
                            : "bg-[#151C27] border-white/[0.06] text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-[#1A2330] hover:border-white/[0.14]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${def.dotColor} shrink-0`} />
                        <span>{def.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Textarea (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8B0BD] mb-2">
                  Personal Review <span className="text-[#6F7886] font-normal normal-case">(Optional)</span>
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your thoughts, notes, or critique..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#1D2734] border border-white/[0.08] text-sm text-[#F5F7FA] placeholder-[#6F7886] focus:outline-none focus:border-[#3B9EFF] transition-colors resize-none font-sans"
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={containsSpoilers}
                    onChange={(e) => setContainsSpoilers(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#1D2734] border-white/20 text-[#3B9EFF] focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-[#A8B0BD]">
                    Review contains spoilers
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: SUMMARY & ADD TO LIBRARY
             ========================================================================= */}
          {step === 3 && selectedMedia && (
            <div className="flex flex-col gap-4 flex-1">
              {saveSuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-center animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 flex items-center justify-center shadow-lg shadow-[#22C55E]/20 animate-bounce">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#F5F7FA]">
                      Added to Library!
                    </h3>
                    <p className="text-xs text-[#A8B0BD] mt-1">
                      {selectedMedia.title} has been saved to your collection.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 flex-1">
                  {/* Summary Card */}
                  <div className="p-4 rounded-xl bg-[#1D2734] border border-white/[0.06] flex gap-3.5">
                    {selectedMedia.posterPath ? (
                      <img
                        src={selectedMedia.posterPath}
                        alt={selectedMedia.title}
                        className="w-16 h-24 rounded-lg object-cover bg-[#151C27] shrink-0 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-24 rounded-lg bg-[#151C27] shrink-0 flex items-center justify-center text-[#6F7886]">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {renderFormatBadge(selectedMedia.mediaType)}
                          {selectedMedia.year && (
                            <span className="text-xs text-[#A8B0BD]">
                              {selectedMedia.year}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-[#F5F7FA] truncate mt-1">
                          {selectedMedia.title}
                        </h3>
                        {selectedMedia.genres && selectedMedia.genres.length > 0 && (
                          <p className="text-xs text-[#6F7886] truncate mt-0.5">
                            {selectedMedia.genres.slice(0, 3).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Configured Details Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#1D2734]/70 border border-white/[0.04]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886] block">
                        Watch Status
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        {(() => {
                          const cfg = STATUS_CONFIG[status];
                          const Icon = cfg.icon;
                          return (
                            <span className={`text-xs font-semibold flex items-center gap-1.5 ${cfg.text}`}>
                              <Icon className="w-3.5 h-3.5" />
                              <span>{cfg.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#1D2734]/70 border border-white/[0.04]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886] block">
                        Personal Rating
                      </span>
                      <div className="mt-1">
                        {rating ? (
                          <span className={`text-xs font-semibold inline-flex items-center gap-1.5 ${RATING_CONFIG[rating].textColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${RATING_CONFIG[rating].dotColor}`} />
                            <span>{RATING_CONFIG[rating].label}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-[#6F7886]">
                            No rating provided
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedMedia.mediaType !== "movie" && (
                      <div className="p-3 rounded-xl bg-[#1D2734]/70 border border-white/[0.04] col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886] block">
                          Episodes Watched
                        </span>
                        <span className="text-xs font-semibold text-[#F5F7FA] mt-1 block">
                          {episodes} of {selectedMedia.totalEpisodes || "∞"} episodes
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Review Excerpt */}
                  {review.trim() && (
                    <div className="p-3 rounded-xl bg-[#1D2734]/70 border border-white/[0.04]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886]">
                          Personal Review
                        </span>
                        {containsSpoilers && (
                          <span className="text-[10px] font-semibold text-[#F43F5E] bg-[#F43F5E]/10 px-1.5 py-0.5 rounded border border-[#F43F5E]/20">
                            Spoilers
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A8B0BD] line-clamp-3 italic">
                        &ldquo;{review.trim()}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Error banner */}
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-xs text-[#F43F5E] flex flex-col gap-2">
                      <p>{errorMessage}</p>
                      {errorMessage.toLowerCase().includes("auth") && (
                        <Link
                          href="/login"
                          className="text-xs font-bold text-white underline hover:no-underline"
                        >
                          Click here to sign in
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-white/[0.06] bg-[#1A2330]/40 flex items-center justify-between gap-3">
          {step === 1 ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#6F7886]">
                Step 1 of 3: Select Title
              </span>
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl text-xs font-semibold text-[#A8B0BD] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : step === 2 ? (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => (media ? onClose() : setStep(1))}
                className="h-10 px-4 rounded-xl text-xs font-semibold text-[#A8B0BD] hover:text-white hover:bg-white/[0.04] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{media ? "Cancel" : "Back"}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-10 px-5 rounded-xl text-xs font-semibold bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white transition-all active:scale-95 shadow-md shadow-[#3B9EFF]/20 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Summary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                disabled={isSubmitting || saveSuccess}
                onClick={() => setStep(2)}
                className="h-10 px-4 rounded-xl text-xs font-semibold text-[#A8B0BD] hover:text-white hover:bg-white/[0.04] disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Edit</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || saveSuccess}
                onClick={handleSave}
                className="h-10 px-6 rounded-xl text-xs font-semibold bg-[#3B9EFF] hover:bg-[#5AAFFF] disabled:opacity-50 text-white transition-all active:scale-95 shadow-md shadow-[#3B9EFF]/20 inline-flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Library</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
