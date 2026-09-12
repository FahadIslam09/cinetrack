"use client";

import { useTransition, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Layers,
  Film,
  Tv,
  Flame,
  Globe,
  Tag,
  RotateCcw,
  Award,
  X,
  Loader2,
} from "lucide-react";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { OTT_PROVIDERS, DISCOVER_GENRES } from "@/lib/media/providers";
export { OTT_PROVIDERS, DISCOVER_GENRES };

interface DiscoverFilterBarProps {
  currentType?: string;
  currentProvider?: string;
  currentGenre?: string;
  currentRating?: string;
  totalResults?: number;
  isPending?: boolean;
  onUpdateFilter?: (key: string, value: string) => void;
  onResetFilters?: () => void;
}

export function DiscoverFilterBar({
  currentType = "all",
  currentProvider = "all",
  currentGenre = "all",
  currentRating = "all",
  totalResults,
  isPending: externalPending,
  onUpdateFilter,
  onResetFilters,
}: DiscoverFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [internalPending, startTransition] = useTransition();
  const [localPending, setLocalPending] = useState(false);

  const isPending = externalPending !== undefined ? externalPending : (localPending || internalPending);

  useEffect(() => {
    setLocalPending(false);
  }, [searchParams, currentType, currentProvider, currentGenre, currentRating]);

  useEffect(() => {
    if (!localPending) return;
    const timer = setTimeout(() => setLocalPending(false), 6000);
    return () => clearTimeout(timer);
  }, [localPending]);

  // 1. Media Type Tabs (Segmented Control)
  const mediaTabs = [
    { id: "all", label: "All Media", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "movie", label: "Movies", icon: <Film className="w-3.5 h-3.5" /> },
    { id: "series", label: "Series", icon: <Tv className="w-3.5 h-3.5" /> },
    { id: "anime", label: "Anime", icon: <Flame className="w-3.5 h-3.5" /> },
  ];

  // 2. Streaming Platform Options with logos
  const streamingOptions: DropdownOption[] = useMemo(
    () => [
      {
        id: "all",
        label: "All Platforms",
        icon: <Globe className="w-3.5 h-3.5 text-[#3B9EFF]" />,
      },
      ...OTT_PROVIDERS.map((provider) => ({
        id: provider.id,
        label: provider.name,
        icon: (
          <img
            src={provider.logo}
            alt={provider.name}
            className="w-4 h-4 rounded object-cover shrink-0"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ),
      })),
    ],
    []
  );

  // 3. Genre Options
  const genreOptions: DropdownOption[] = useMemo(
    () => [
      {
        id: "all",
        label: "All Genres",
        icon: <Tag className="w-3.5 h-3.5 text-[#3B9EFF]" />,
      },
      ...DISCOVER_GENRES.map((g) => ({
        id: g,
        label: g,
      })),
    ],
    []
  );

  // 4. Rating Options with distinct color dots
  const ratingOptions: DropdownOption[] = useMemo(
    () => [
      {
        id: "all",
        label: "All Ratings",
        icon: <Award className="w-3.5 h-3.5 text-[#3B9EFF]" />,
      },
      {
        id: "masterpiece",
        label: "Masterpiece",
        dot: "bg-[#F5C84B]",
      },
      {
        id: "good",
        label: "Good",
        dot: "bg-[#3B9EFF]",
      },
      {
        id: "average",
        label: "Average",
        dot: "bg-[#F59E0B]",
      },
      {
        id: "poor",
        label: "Poor",
        dot: "bg-[#F43F5E]",
      },
    ],
    []
  );

  const handleUpdateFilter = (key: string, value: string) => {
    if (onUpdateFilter) {
      onUpdateFilter(key, value);
      return;
    }

    setLocalPending(true);
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");

    if (!value || value === "all" || value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
      return;
    }

    setLocalPending(true);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasActiveFilters =
    currentType !== "all" ||
    (currentProvider !== "all" && currentProvider !== "") ||
    (currentGenre !== "all" && currentGenre !== "") ||
    (currentRating !== "all" && currentRating !== "");

  return (
    <div
      className={`w-full relative z-30 rounded-2xl bg-gradient-to-b from-[#141B26]/90 via-[#0F1420]/90 to-[#0A0E17]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.4)] p-2.5 sm:p-3 flex flex-col gap-3 transition-opacity duration-200 ${
        isPending ? "opacity-90" : "opacity-100"
      }`}
    >
      {/* Top subtle glow highlight line */}
      <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#3B9EFF]/30 to-transparent pointer-events-none" />

      {/* Laser beam sweep animation during active filtering */}
      {isPending && (
        <div className="absolute inset-x-0 -top-[1px] h-[2px] overflow-hidden rounded-t-2xl z-50 pointer-events-none">
          <div className="absolute inset-0 bg-[#3B9EFF]/40 shadow-[0_0_8px_#3B9EFF]" />
          <div className="h-full w-full bg-gradient-to-r from-transparent via-[#5AAFFF] to-transparent animate-laser-beam shadow-[0_0_14px_#3B9EFF]" />
        </div>
      )}

      {/* Main Bar: Flex row on Desktop, Stack on Mobile */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 w-full">
        {/* Left Section: Segmented Type Switcher + Dropdown Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-2.5 sm:gap-3 min-w-0">
          {/* 1. Media Type Tabs in unified segmented rail */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#080C14]/90 border border-white/[0.06] shadow-inner overflow-x-auto no-scrollbar shrink-0">
            {mediaTabs.map((tab) => {
              const isActive = currentType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleUpdateFilter("type", tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer select-none active:scale-95 outline-none focus:outline-none focus-visible:outline-none border ${
                    isActive
                      ? "bg-gradient-to-r from-[#3B9EFF] to-[#2563EB] text-white font-semibold border-transparent shadow-md shadow-[#3B9EFF]/25"
                      : "text-[#8E97A6] hover:text-[#F5F7FA] hover:bg-white/[0.04] border-transparent"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-[#6F7886]"}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Vertical Divider on Desktop */}
          <div className="hidden lg:block w-[1px] h-6 bg-white/[0.08] shrink-0" />

          {/* 2. Three Dropdowns (Platform, Genre, Rating) */}
          <div className="grid grid-cols-3 lg:flex lg:items-center gap-2 w-full lg:w-auto">
            {/* Streaming Platform */}
            <CustomDropdown
              value={currentProvider}
              onChange={(val) => handleUpdateFilter("provider", val)}
              options={streamingOptions}
              align="left"
              className="w-full lg:w-[165px] xl:w-[185px] shrink-0 min-w-0"
              buttonClassName="h-9 px-2.5 sm:px-3 text-[11px] sm:text-xs rounded-xl bg-[#111724]/90 hover:bg-[#161F30]"
              menuWidth="w-[210px]"
              ariaLabel="Filter by streaming platform"
              isLoading={isPending}
            />

            {/* Genre */}
            <CustomDropdown
              value={currentGenre}
              onChange={(val) => handleUpdateFilter("genre", val)}
              options={genreOptions}
              align="left"
              className="w-full lg:w-[150px] xl:w-[170px] shrink-0 min-w-0"
              buttonClassName="h-9 px-2.5 sm:px-3 text-[11px] sm:text-xs rounded-xl bg-[#111724]/90 hover:bg-[#161F30]"
              menuWidth="w-[190px]"
              ariaLabel="Filter by genre"
              isLoading={isPending}
            />

            {/* Rating */}
            <CustomDropdown
              value={currentRating}
              onChange={(val) => handleUpdateFilter("rating", val)}
              options={ratingOptions}
              align="right"
              className="w-full lg:w-[150px] xl:w-[170px] shrink-0 min-w-0"
              buttonClassName="h-9 px-2.5 sm:px-3 text-[11px] sm:text-xs rounded-xl bg-[#111724]/90 hover:bg-[#161F30]"
              menuWidth="w-[190px]"
              ariaLabel="Filter by rating"
              isLoading={isPending}
            />
          </div>
        </div>

        {/* Right Section: Results Counter Badge & Reset Button */}
        <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0 pt-1 lg:pt-0 border-t border-white/[0.04] lg:border-t-0">
          {isPending ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090D15]/90 border border-[#3B9EFF]/50 shadow-[0_0_12px_rgba(59,158,255,0.25)] text-xs animate-in fade-in duration-75">
              <Loader2 className="w-3.5 h-3.5 text-[#3B9EFF] animate-spin shrink-0" />
              <span className="text-[#3B9EFF] font-semibold whitespace-nowrap">Updating...</span>
            </div>
          ) : totalResults !== undefined ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080C14]/80 border border-white/[0.06] text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B9EFF] animate-pulse shrink-0" />
              <span className="text-[#8E97A6] font-medium whitespace-nowrap">
                {hasActiveFilters ? (
                  <>
                    Showing <strong className="text-[#F5F7FA] font-semibold">{totalResults}</strong> {totalResults === 1 ? "title" : "titles"}
                  </>
                ) : (
                  <>
                    <strong className="text-[#F5F7FA] font-semibold">{totalResults}</strong> {totalResults === 1 ? "title" : "titles"}
                  </>
                )}
              </span>
            </div>
          ) : null}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F43F5E] bg-[#F43F5E]/10 hover:bg-[#F43F5E]/15 border border-[#F43F5E]/25 hover:border-[#F43F5E]/40 transition-all cursor-pointer select-none active:scale-95"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags Strip (removable badges) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 pt-2.5 border-t border-white/[0.06] flex-wrap text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886] mr-1">
            Active:
          </span>

          {currentType !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 text-[11px] font-medium">
              <span>{mediaTabs.find((t) => t.id === currentType)?.label}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter("type", "all")}
                className="hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                title="Remove format filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentProvider !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 text-[11px] font-medium">
              <span>{streamingOptions.find((o) => o.id === currentProvider)?.label}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter("provider", "all")}
                className="hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                title="Remove platform filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentGenre !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 text-[11px] font-medium">
              <span>{currentGenre}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter("genre", "all")}
                className="hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                title="Remove genre filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentRating !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 text-[11px] font-medium">
              <span>{ratingOptions.find((o) => o.id === currentRating)?.label}</span>
              <button
                type="button"
                onClick={() => handleUpdateFilter("rating", "all")}
                className="hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                title="Remove rating filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] text-[#A8B0BD] hover:text-[#F5F7FA] underline underline-offset-2 ml-1 cursor-pointer transition-colors font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
