"use client";

import { useState, useEffect, useRef, useTransition, useMemo } from "react";
import { createPortal } from "react-dom";
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
  ChevronDown,
  Trash2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { upsertMediaLog, deleteMediaLog } from "@/actions/tracking";
import { RatingCategory, RATING_CONFIG, parseRating } from "@/lib/rating";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { SeasonInfo } from "@/app/api/tv/[id]/seasons/route";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";

export interface QuickAddModalProps {
  media?: NormalizedMedia | null;
  isOpen: boolean;
  onClose: () => void;
  initialLog?: {
    status?: string;
    rating?: RatingCategory | string | number | null;
    episodesWatched?: number;
    currentSeason?: number;
    currentEpisode?: number;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // TV Series / Anime Season & Episode tracking state
  const [seasonsData, setSeasonsData] = useState<SeasonInfo[]>([]);
  const [totalSeasons, setTotalSeasons] = useState<number>(1);
  const [totalEpisodes, setTotalEpisodes] = useState<number>(1);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);

  // Delete confirmation state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Lock background screen scroll cleanly across all devices when modal is open
  useScrollLock(isOpen);

  // Handle ESC key to close modal or dismiss confirmation popup
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDeleteConfirmOpen) {
          if (!isDeleting) setIsDeleteConfirmOpen(false);
        } else if (!isSubmitting) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, isDeleting, isDeleteConfirmOpen, onClose]);

  // Initialize modal state on open or media change
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setRatingError(null);
      setSaveSuccess(false);
      setIsDeleteConfirmOpen(false);
      setIsDeleting(false);
      setDeleteError(null);

      if (media) {
        // Pre-selected media (e.g. from card "+ Add") -> start directly at Step 2
        setSelectedMedia(media);
        setStep(2);
        const resolvedStatus =
          (initialLog?.status as WatchStatus) ||
          (media.mediaType === "movie" ? "completed" : "watching");
        setStatus(resolvedStatus);
        setRating(resolvedStatus === "plan_to_watch" ? null : parseRating(initialLog?.rating));
        setEpisodes(initialLog?.episodesWatched || 0);
        setSelectedSeason(initialLog?.currentSeason || 1);
        setSelectedEpisode(initialLog?.currentEpisode || 1);
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
        setSelectedSeason(1);
        setSelectedEpisode(1);
        setReview("");
        setContainsSpoilers(false);

        // Auto-focus search input
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen, media, initialLog]);

  // Fetch season breakdown when a series/anime is selected
  useEffect(() => {
    if (!isOpen || !selectedMedia || selectedMedia.mediaType === "movie") {
      setSeasonsData([]);
      setIsLoadingSeasons(false);
      return;
    }

    let isMounted = true;
    setIsLoadingSeasons(true);

    const fetchSeasons = async () => {
      try {
        const res = await fetch(
          `/api/tv/${selectedMedia.sourceId}/seasons?source=${selectedMedia.source}&totalEpisodes=${selectedMedia.totalEpisodes || 0}`
        );
        if (!res.ok) throw new Error("Failed to load seasons");
        const data = await res.json();
        if (!isMounted) return;

        const seasons: SeasonInfo[] =
          data.seasons && data.seasons.length > 0
            ? data.seasons
            : [
                {
                  seasonNumber: 1,
                  name: "Season 1",
                  episodeCount: selectedMedia.totalEpisodes || 10,
                },
              ];

        setSeasonsData(seasons);
        setTotalSeasons(data.totalSeasons || seasons.length);
        const totalEps =
          data.totalEpisodes ||
          selectedMedia.totalEpisodes ||
          seasons.reduce((acc: number, s: SeasonInfo) => acc + s.episodeCount, 0);
        setTotalEpisodes(totalEps);

        // Initialize Season & Episode from initialLog if available
        if (initialLog?.currentSeason) {
          const matchSeason = seasons.find((s) => s.seasonNumber === initialLog.currentSeason);
          const sNum = matchSeason ? matchSeason.seasonNumber : seasons[0].seasonNumber;
          setSelectedSeason(sNum);
          const maxEps = matchSeason?.episodeCount || seasons[0].episodeCount;
          setSelectedEpisode(
            initialLog.currentEpisode ? Math.min(initialLog.currentEpisode, maxEps) : 1
          );
        } else if (status === "completed") {
          const lastSeason = seasons[seasons.length - 1];
          setSelectedSeason(lastSeason.seasonNumber);
          setSelectedEpisode(lastSeason.episodeCount);
        } else {
          setSelectedSeason(seasons[0].seasonNumber);
          setSelectedEpisode(1);
        }
      } catch (err) {
        console.error("Failed to load seasons:", err);
        if (!isMounted) return;
        const fallbackSeasons: SeasonInfo[] = [
          {
            seasonNumber: 1,
            name: "Season 1",
            episodeCount: selectedMedia.totalEpisodes || 10,
          },
        ];
        setSeasonsData(fallbackSeasons);
        setTotalSeasons(1);
        setTotalEpisodes(selectedMedia.totalEpisodes || 10);
        setSelectedSeason(1);
        setSelectedEpisode(1);
      } finally {
        if (isMounted) {
          setIsLoadingSeasons(false);
        }
      }
    };

    fetchSeasons();

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedMedia, initialLog]);

  // Handle status changes with automatic completion logic
  const handleStatusChange = (newStatus: WatchStatus) => {
    setStatus(newStatus);
    setRatingError(null);
    if (newStatus === "plan_to_watch") {
      setRating(null);
    }
    if (newStatus === "completed" && selectedMedia?.mediaType !== "movie" && seasonsData.length > 0) {
      const lastSeason = seasonsData[seasonsData.length - 1];
      setSelectedSeason(lastSeason.seasonNumber);
      setSelectedEpisode(lastSeason.episodeCount);
    }
  };

  // Handle Season selection (adjusting available episodes)
  const handleSeasonChange = (newSeasonNum: number) => {
    setSelectedSeason(newSeasonNum);
    const targetSeason = seasonsData.find((s) => s.seasonNumber === newSeasonNum);
    const maxEps = targetSeason?.episodeCount || 1;
    setSelectedEpisode((prev) => Math.min(Math.max(1, prev), maxEps));
  };

  // Handle Episode selection
  const handleEpisodeChange = (newEpNum: number) => {
    const targetSeason = seasonsData.find((s) => s.seasonNumber === selectedSeason);
    const maxEps = targetSeason?.episodeCount || 1;
    setSelectedEpisode(Math.min(Math.max(1, newEpNum), maxEps));
  };

  // Calculate cumulative episodes watched for database storage and progress bar
  const calculateCumulativeEpisodes = (seasonNum: number, episodeNum: number): number => {
    if (status === "completed") {
      return totalEpisodes || seasonsData.reduce((acc, s) => acc + s.episodeCount, 0);
    }
    let total = 0;
    for (const s of seasonsData) {
      if (s.seasonNumber < seasonNum) {
        total += s.episodeCount;
      } else if (s.seasonNumber === seasonNum) {
        total += Math.min(episodeNum, s.episodeCount);
        break;
      }
    }
    return total > 0 ? total : episodeNum;
  };

  // Memoized options for CustomDropdown in Watch Progress
  const seasonOptions = useMemo<DropdownOption[]>(() => {
    return seasonsData.map((s) => ({
      id: String(s.seasonNumber),
      label: s.name || `Season ${s.seasonNumber}`,
      count: s.episodeCount,
    }));
  }, [seasonsData]);

  const episodeOptions = useMemo<DropdownOption[]>(() => {
    const targetSeason = seasonsData.find((s) => s.seasonNumber === selectedSeason);
    const count = targetSeason?.episodeCount || 1;
    return Array.from({ length: count }, (_, i) => ({
      id: String(i + 1),
      label: `Episode ${i + 1}`,
    }));
  }, [seasonsData, selectedSeason]);

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

  if (!isOpen || !mounted) return null;

  // Handle media selection from Step 1
  const handleSelectMedia = (selected: NormalizedMedia) => {
    setSelectedMedia(selected);
    setStatus(selected.mediaType === "movie" ? "completed" : "watching");
    setSelectedSeason(1);
    setSelectedEpisode(1);
    setEpisodes(0);
    setRating(null);
    setRatingError(null);
    setReview("");
    setContainsSpoilers(false);
    setErrorMessage(null);
    setStep(2);
  };

  // Submit to library in Step 3
  const handleSave = async () => {
    if (!selectedMedia) return;

    if (status !== "plan_to_watch" && !rating) {
      setErrorMessage("Please select a rating before saving.");
      setRatingError("Please select a rating to continue.");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const isSeries = selectedMedia.mediaType !== "movie";
    const cumulativeEps = isSeries
      ? calculateCumulativeEpisodes(selectedSeason, selectedEpisode)
      : 1;

    try {
      const res = await upsertMediaLog({
        media: selectedMedia,
        status,
        rating,
        episodesWatched: cumulativeEps,
        currentSeason: isSeries ? selectedSeason : 1,
        currentEpisode: isSeries ? selectedEpisode : 1,
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

  // Delete media from library
  const handleDelete = async () => {
    const targetMedia = selectedMedia || media;
    if (!targetMedia) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteMediaLog(targetMedia.id);
      if (res?.error) {
        setDeleteError(res.error);
        setIsDeleting(false);
      } else {
        setIsDeleting(false);
        setIsDeleteConfirmOpen(false);
        onClose();
        onSuccess?.();
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to remove item from library.");
      setIsDeleting(false);
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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-library-title"
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overscroll-contain"
    >
      <div
        className="w-full max-w-lg bg-[#151C27] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90dvh] sm:h-[620px] max-h-[92dvh] sm:max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Step Indicator */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-[#1A2330]/40 flex flex-col gap-3 shrink-0">
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
                {initialLog?.status ? "Edit Library Entry" : "Add to Library"}
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
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                                  if (fallback) fallback.classList.remove("hidden");
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-11 h-16 rounded-lg bg-[#151C27] shrink-0 ${
                                item.posterPath ? "hidden" : "flex"
                              } items-center justify-center text-[#6F7886] border border-white/[0.04]`}
                            >
                              {item.mediaType === "movie" ? (
                                <Film className="w-5 h-5" />
                              ) : item.mediaType === "anime" ? (
                                <Flame className="w-5 h-5" />
                              ) : (
                                <Tv className="w-5 h-5" />
                              )}
                            </div>
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
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-14 rounded-lg bg-[#151C27] shrink-0 ${
                      selectedMedia.posterPath ? "hidden" : "flex"
                    } items-center justify-center text-[#6F7886]`}
                  >
                    <Film className="w-5 h-5" />
                  </div>
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
                        onClick={() => handleStatusChange(st)}
                        className={`h-10 px-3 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center gap-2 min-w-0 cursor-pointer active:scale-95 select-none outline-none focus:outline-none focus-visible:outline-none ${
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

              {/* Watch Progress (TV & Anime) - Clean, compact, only for Watching status */}
              {selectedMedia.mediaType !== "movie" && status === "watching" && (
                <div className="relative z-20 flex flex-col gap-2 rounded-xl bg-[#1D2734]/50 border border-white/[0.06] p-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#A8B0BD]">
                      Watch Progress
                    </label>
                    {!isLoadingSeasons && (
                      <span className="text-[11px] font-semibold text-[#3B9EFF] bg-[#3B9EFF]/10 px-2 py-0.5 rounded-md border border-[#3B9EFF]/20">
                        {`S${String(selectedSeason).padStart(2, "0")} E${String(selectedEpisode).padStart(2, "0")}`}
                        {totalEpisodes > 0 && ` · ${calculateCumulativeEpisodes(selectedSeason, selectedEpisode)}/${totalEpisodes} eps`}
                      </span>
                    )}
                  </div>

                  {isLoadingSeasons ? (
                    <div className="h-12 rounded-lg bg-[#151C27] border border-white/[0.04] flex items-center justify-center gap-2 text-xs text-[#A8B0BD]">
                      <Loader2 className="w-4 h-4 text-[#3B9EFF] animate-spin" />
                      <span>Loading seasons &amp; episodes...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                      {/* Season Selector */}
                      <div className="min-w-0">
                        <label className="block text-[11px] font-medium text-[#6F7886] mb-1">
                          Season
                        </label>
                        <CustomDropdown
                          value={String(selectedSeason)}
                          onChange={(val) => handleSeasonChange(Number(val))}
                          options={seasonOptions}
                          className="w-full"
                          menuWidth="w-full min-w-[150px]"
                          buttonClassName="h-10 rounded-xl"
                          highlightActive={false}
                          dropDirection="auto"
                          ariaLabel="Select Season"
                        />
                      </div>

                      {/* Episode Selector - Only shows episodes for selected season */}
                      <div className="min-w-0">
                        <label className="block text-[11px] font-medium text-[#6F7886] mb-1">
                          Episode
                        </label>
                        <CustomDropdown
                          value={String(selectedEpisode)}
                          onChange={(val) => handleEpisodeChange(Number(val))}
                          options={episodeOptions}
                          className="w-full"
                          menuWidth="w-full min-w-[150px]"
                          buttonClassName="h-10 rounded-xl"
                          highlightActive={false}
                          dropDirection="auto"
                          align="right"
                          ariaLabel="Select Episode"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Personal Rating Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#A8B0BD]">
                      Personal Rating
                    </label>
                    {status !== "plan_to_watch" && (
                      <span className="text-rose-400 text-xs font-bold" title="Required">*</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {status === "plan_to_watch" ? (
                      <span className="text-[11px] font-medium text-[#6F7886] italic">
                        Not available for Want to Watch
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-semibold">
                          {rating ? (
                            <span className={RATING_CONFIG[rating].textColor}>
                              {RATING_CONFIG[rating].label}
                            </span>
                          ) : (
                            <span className="text-amber-400/90 text-[11px] font-semibold">
                              Required
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {status === "plan_to_watch" ? (
                  <div className="p-3.5 rounded-xl bg-[#1D2734]/50 border border-white/[0.04] text-center text-xs text-[#6F7886] select-none flex items-center justify-center gap-2">
                    <Bookmark className="w-4 h-4 text-[#A855F7]/60 shrink-0" />
                    <span>Rating disabled for &ldquo;Want to Watch&rdquo; titles.</span>
                  </div>
                ) : (
                  <>
                    <div
                      className={`grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#1D2734] p-1.5 rounded-xl border transition-all ${
                        ratingError
                          ? "border-rose-500/60 ring-1 ring-rose-500/30"
                          : "border-white/[0.06]"
                      }`}
                    >
                      {(["poor", "average", "good", "masterpiece"] as const).map((catId) => {
                        const isSelected = rating === catId;
                        const def = RATING_CONFIG[catId];
                        return (
                          <button
                            key={catId}
                            type="button"
                            onClick={() => {
                              setRating(catId);
                              setRatingError(null);
                            }}
                            className={`h-10 px-2 rounded-lg text-xs font-semibold border transition-all duration-150 flex items-center justify-center gap-1.5 min-w-0 active:scale-95 cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none ${
                              isSelected
                                ? `${def.activeBg} ${def.activeBorder} ${def.activeText} shadow-sm`
                                : "bg-[#151C27] border-white/[0.06] text-[#A8B0BD] hover:text-[#F5F7FA] hover:bg-[#1A2330] hover:border-white/[0.14]"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${def.dotColor} shrink-0`} />
                            <span>{def.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {ratingError && (
                      <p className="text-[11px] font-medium text-rose-400 mt-1.5 animate-in fade-in flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{ratingError}</span>
                      </p>
                    )}
                  </>
                )}
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
                {/* Premium Spoiler Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={containsSpoilers}
                  onClick={() => setContainsSpoilers(!containsSpoilers)}
                  className={`w-full mt-2.5 p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer select-none text-left group ${
                    containsSpoilers
                      ? "bg-amber-500/[0.08] border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                      : "bg-[#151C27]/80 hover:bg-[#1A2330] border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        containsSpoilers
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm"
                          : "bg-white/[0.04] text-[#6F7886] group-hover:text-[#A8B0BD]"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-xs font-semibold block transition-colors ${
                          containsSpoilers ? "text-amber-300" : "text-[#F5F7FA]"
                        }`}
                      >
                        Review contains spoilers
                      </span>
                      <span className="text-[11px] text-[#6F7886] block truncate">
                        {containsSpoilers
                          ? "Spoiler warning will blur text until clicked"
                          : "Warn community readers about major plot details"}
                      </span>
                    </div>
                  </div>

                  {/* Polished iOS-style Toggle Switch */}
                  <div
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                      containsSpoilers
                        ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                        : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        containsSpoilers ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
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
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-16 h-24 rounded-lg bg-[#151C27] shrink-0 ${
                        selectedMedia.posterPath ? "hidden" : "flex"
                      } items-center justify-center text-[#6F7886]`}
                    >
                      <Film className="w-6 h-6" />
                    </div>
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
                        {status === "plan_to_watch" ? (
                          <span className="text-xs font-medium text-[#6F7886] italic">
                            Unrated (Want to Watch)
                          </span>
                        ) : rating ? (
                          <span className={`text-xs font-semibold inline-flex items-center gap-1.5 ${RATING_CONFIG[rating].textColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${RATING_CONFIG[rating].dotColor}`} />
                            <span>{RATING_CONFIG[rating].label}</span>
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-rose-400">
                            Rating required
                          </span>
                        )}
                      </div>
                    </div>

                    {selectedMedia.mediaType !== "movie" && (
                      <div className="p-3 rounded-xl bg-[#1D2734]/70 border border-white/[0.04] col-span-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886] block">
                          Watch Progress
                        </span>
                        <span className="text-xs font-semibold text-[#F5F7FA] mt-1 block">
                          {status === "completed"
                            ? `Completed · All ${totalEpisodes || selectedMedia.totalEpisodes || "∞"} episodes`
                            : status === "watching"
                            ? `Season ${selectedSeason}, Episode ${selectedEpisode} (S${String(selectedSeason).padStart(2, "0")} E${String(selectedEpisode).padStart(2, "0")}) · ${calculateCumulativeEpisodes(selectedSeason, selectedEpisode)} of ${totalEpisodes || selectedMedia.totalEpisodes || "∞"} eps`
                            : `${STATUS_CONFIG[status].label}`}
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
        <div className="p-4 sm:p-5 border-t border-white/[0.06] bg-[#1A2330]/90 backdrop-blur-md flex items-center justify-between gap-2 sm:gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-5">
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
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => (media ? onClose() : setStep(1))}
                  className="h-10 px-3 sm:px-4 rounded-xl text-xs font-semibold text-[#A8B0BD] hover:text-white hover:bg-white/[0.04] transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{media ? "Cancel" : "Back"}</span>
                </button>

                {initialLog?.status && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="h-10 px-2.5 sm:px-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                    title="Remove from Library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove from Library</span>
                    <span className="sm:hidden">Remove</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (status !== "plan_to_watch" && !rating) {
                    setRatingError("Please select a rating to continue.");
                    return;
                  }
                  setRatingError(null);
                  setStep(3);
                }}
                className="h-10 px-4 sm:px-5 rounded-xl text-xs font-semibold bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white transition-all active:scale-95 shadow-md shadow-[#3B9EFF]/20 inline-flex items-center justify-center gap-1.5 cursor-pointer ml-auto shrink-0"
              >
                <span className="sm:hidden">Continue</span>
                <span className="hidden sm:inline">Continue to Summary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isSubmitting || saveSuccess || isDeleting}
                  onClick={() => setStep(2)}
                  className="h-10 px-3 sm:px-4 rounded-xl text-xs font-semibold text-[#A8B0BD] hover:text-white hover:bg-white/[0.04] disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to Edit</span>
                  <span className="sm:hidden">Back</span>
                </button>

                {initialLog?.status && (
                  <button
                    type="button"
                    disabled={isSubmitting || saveSuccess || isDeleting}
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="h-10 px-2.5 sm:px-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-95 shrink-0"
                    title="Remove from Library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove from Library</span>
                    <span className="sm:hidden">Remove</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={isSubmitting || saveSuccess || isDeleting}
                onClick={handleSave}
                className="h-10 px-5 sm:px-6 rounded-xl text-xs font-semibold bg-[#3B9EFF] hover:bg-[#5AAFFF] disabled:opacity-50 text-white transition-all active:scale-95 shadow-md shadow-[#3B9EFF]/20 inline-flex items-center justify-center gap-2 cursor-pointer ml-auto shrink-0"
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
                    <span>{initialLog?.status ? "Update Library" : "Add to Library"}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          REMOVE FROM LIBRARY CONFIRMATION POPUP (Glassmorphic, Premium, Polished)
         ========================================================================= */}
      {isDeleteConfirmOpen && (selectedMedia || media) && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          aria-describedby="delete-confirm-desc"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overscroll-contain"
          onClick={() => {
            if (!isDeleting) setIsDeleteConfirmOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#18202F] via-[#121722] to-[#0D121A] border border-rose-500/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_45px_rgba(244,63,94,0.12)] p-6 overflow-hidden animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-rose-500/15 blur-2xl pointer-events-none rounded-full" />

            {/* Illuminated Danger Badge */}
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-[0_0_24px_rgba(244,63,94,0.25)] ring-1 ring-rose-400/20">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            {/* Heading */}
            <h3
              id="delete-confirm-title"
              className="text-lg font-bold text-[#F5F7FA] tracking-tight mb-1"
            >
              Remove from Library?
            </h3>

            {/* Media Preview Chip */}
            {(() => {
              const item = selectedMedia || media;
              if (!item) return null;
              return (
                <div className="my-3.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3 text-left">
                  {item.posterPath ? (
                    <img
                      src={item.posterPath}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded-lg shrink-0 shadow-sm border border-white/10"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-14 rounded-lg bg-[#151C27] shrink-0 ${
                      item.posterPath ? "hidden" : "flex"
                    } items-center justify-center text-[#6F7886]`}
                  >
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs text-[#F5F7FA] truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#A8B0BD]">
                      {item.year && <span>{item.year}</span>}
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="capitalize">{item.mediaType}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Explanatory Warning */}
            <p
              id="delete-confirm-desc"
              className="text-xs text-[#A8B0BD] leading-relaxed mb-5"
            >
              This will permanently delete this title, your watch progress, rating, and personal notes from your library.
            </p>

            {/* Error Message if Deletion Failed */}
            {deleteError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400 text-center animate-in fade-in">
                {deleteError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 h-10 rounded-xl text-xs font-semibold text-[#A8B0BD] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] border border-rose-400/40 shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
