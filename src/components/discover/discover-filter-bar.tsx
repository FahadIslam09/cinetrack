"use client";

import { useTransition, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Film, Tv, Flame, Globe, Tag, RotateCcw, Star } from "lucide-react";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { OTT_PROVIDERS, DISCOVER_GENRES } from "@/lib/media/providers";
export { OTT_PROVIDERS, DISCOVER_GENRES };

interface DiscoverFilterBarProps {
  currentType?: string;
  currentProvider?: string;
  currentGenre?: string;
  currentRating?: string;
  totalResults?: number;
}

export function DiscoverFilterBar({
  currentType = "all",
  currentProvider = "all",
  currentGenre = "all",
  currentRating = "all",
  totalResults,
}: DiscoverFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 1. Media Type Tabs (Line 1)
  const mediaTabs = [
    { id: "all", label: "All Media", icon: <Film className="w-3.5 h-3.5" /> },
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
        icon: <Star className="w-3.5 h-3.5 text-[#3B9EFF]" />,
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

  const updateFilter = (key: string, value: string) => {
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

  const resetFilters = () => {
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
    <div className="flex flex-col gap-3 w-full">
      {/* Line 1: Media Types in One Line (All Media, Movies, Series, Anime) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {mediaTabs.map((tab) => {
          const isActive = currentType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateFilter("type", tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? "bg-[#3B9EFF] text-white shadow-sm shadow-[#3B9EFF]/25"
                  : "bg-[#151C27] hover:bg-[#1A2330] text-[#A8B0BD] hover:text-[#F5F7FA] border border-white/[0.06] hover:border-white/[0.12]"
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

      {/* Line 2: Platform, Genres, and Rating Dropdowns in ONE LINE, SIDE BY SIDE */}
      <div
        className={`grid grid-cols-3 gap-1.5 sm:gap-2.5 w-full transition-opacity duration-150 ${
          isPending ? "opacity-75" : "opacity-100"
        }`}
      >
        {/* Dropdown 1: Streaming Platform */}
        <div className="min-w-0">
          <CustomDropdown
            value={currentProvider}
            onChange={(val) => updateFilter("provider", val)}
            options={streamingOptions}
            align="left"
            className="w-full"
            buttonClassName="h-9 px-2 sm:px-3 text-[11px] sm:text-xs"
            menuWidth="w-[195px] sm:w-[210px]"
            ariaLabel="Filter by streaming platform"
          />
        </div>

        {/* Dropdown 2: Genres */}
        <div className="min-w-0">
          <CustomDropdown
            value={currentGenre}
            onChange={(val) => updateFilter("genre", val)}
            options={genreOptions}
            align="left"
            className="w-full"
            buttonClassName="h-9 px-2 sm:px-3 text-[11px] sm:text-xs"
            menuWidth="w-[175px] sm:w-[190px]"
            ariaLabel="Filter by genre"
          />
        </div>

        {/* Dropdown 3: Rating */}
        <div className="min-w-0">
          <CustomDropdown
            value={currentRating}
            onChange={(val) => updateFilter("rating", val)}
            options={ratingOptions}
            align="right"
            className="w-full"
            buttonClassName="h-9 px-2 sm:px-3 text-[11px] sm:text-xs"
            menuWidth="w-[175px] sm:w-[190px]"
            ariaLabel="Filter by rating"
          />
        </div>
      </div>

      {/* Active Filter Bar & Results Count */}
      <div className="flex items-center justify-between text-xs text-[#A8B0BD] px-0.5">
        <span className="text-[11px]">
          {totalResults !== undefined ? (
            hasActiveFilters ? (
              <>
                Showing <strong className="text-[#F5F7FA]">{totalResults}</strong> filtered {totalResults === 1 ? "title" : "titles"}
              </>
            ) : (
              <span className="text-[#6F7886]">{totalResults} {totalResults === 1 ? "title" : "titles"} available</span>
            )
          ) : null}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-semibold text-[#3B9EFF] hover:text-[#60A5FA] inline-flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
