"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  Crown,
  CheckCircle2,
  Award,
  Flame,
  Clock,
  Loader2,
} from "lucide-react";
import { DiscoverFilterBar } from "./discover-filter-bar";
import { MediaCard } from "@/components/media/media-card";
import { LibraryItem } from "@/components/library/library-view";

interface DiscoverViewProps {
  items: LibraryItem[];
  currentType?: string;
  currentProvider?: string;
  currentGenre?: string;
  currentRating?: string;
}

export function DiscoverView({
  items,
  currentType = "all",
  currentProvider = "all",
  currentGenre = "all",
  currentRating = "all",
}: DiscoverViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isFiltering, setIsFiltering] = useState(false);

  const isBusy = isFiltering || isPending;

  // Reset immediate filtering state once new server props or searchParams arrive
  useEffect(() => {
    setIsFiltering(false);
  }, [items, searchParams, currentType, currentProvider, currentGenre, currentRating]);

  // Safety timer to prevent stuck loading indicator
  useEffect(() => {
    if (!isFiltering) return;
    const timer = setTimeout(() => setIsFiltering(false), 6000);
    return () => clearTimeout(timer);
  }, [isFiltering]);

  const updateFilter = (key: string, value: string) => {
    const currentVal =
      key === "type"
        ? currentType
        : key === "provider"
        ? currentProvider
        : key === "genre"
        ? currentGenre
        : key === "rating"
        ? currentRating
        : null;

    if (currentVal?.toLowerCase() === value.toLowerCase()) return;

    // Trigger instant loader feedback synchronously in same event tick
    setIsFiltering(true);

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
    setIsFiltering(true);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  // Categorize based on community ratings
  const ratingCategories = [
    {
      id: "masterpiece",
      title: "Masterpieces",
      label: "Masterpiece",
      description: "Highest rated by users on the platform",
      icon: <Crown className="w-4 h-4 text-[#F5C84B]" />,
      pillClass: "bg-[#F5C84B]/15 text-[#F5C84B] border-[#F5C84B]/30",
      dotClass: "bg-[#F5C84B]",
      items: items.filter((i) => i.userRating === "masterpiece"),
    },
    {
      id: "good",
      title: "Good",
      label: "Good",
      description: "Consistently recommended and praised",
      icon: <CheckCircle2 className="w-4 h-4 text-[#3B9EFF]" />,
      pillClass: "bg-[#3B9EFF]/15 text-[#3B9EFF] border-[#3B9EFF]/30",
      dotClass: "bg-[#3B9EFF]",
      items: items.filter((i) => i.userRating === "good"),
    },
    {
      id: "average",
      title: "Average",
      label: "Average",
      description: "Solid entertainment with mixed community reception",
      icon: <Award className="w-4 h-4 text-[#F59E0B]" />,
      pillClass: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
      dotClass: "bg-[#F59E0B]",
      items: items.filter((i) => i.userRating === "average"),
    },
    {
      id: "poor",
      title: "Poor",
      label: "Poor",
      description: "Disappointing or dropped titles",
      icon: <Flame className="w-4 h-4 text-[#F43F5E]" />,
      pillClass: "bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/30",
      dotClass: "bg-[#F43F5E]",
      items: items.filter((i) => i.userRating === "poor"),
    },
  ];

  // If unrated items exist and user hasn't filtered to a specific rating:
  const unratedItems = items.filter((i) => !i.userRating);
  if (unratedItems.length > 0 && (!currentRating || currentRating === "all")) {
    ratingCategories.push({
      id: "unrated",
      title: "Community Tracked",
      label: "Unrated",
      description: "Recently added titles pending user rating",
      icon: <Clock className="w-4 h-4 text-[#A8B0BD]" />,
      pillClass: "bg-white/[0.06] text-[#A8B0BD] border-white/[0.1]",
      dotClass: "bg-[#A8B0BD]",
      items: unratedItems,
    });
  }

  const activeCategories = ratingCategories.filter((cat) => cat.items.length > 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Filter Bar */}
      <div className="relative z-30">
        <DiscoverFilterBar
          currentType={currentType}
          currentProvider={currentProvider}
          currentGenre={currentGenre}
          currentRating={currentRating}
          totalResults={items.length}
          isPending={isBusy}
          onUpdateFilter={updateFilter}
          onResetFilters={resetFilters}
        />
      </div>

      {/* Results Content Area with Transition Feedback */}
      <div className="relative min-h-[350px]">
        {/* Floating Loading Beacon Indicator */}
        {isBusy && (
          <div className="absolute inset-x-0 top-16 sm:top-24 z-30 flex justify-center pointer-events-none animate-in fade-in duration-75">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#121824]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/80 text-xs font-semibold text-[#F5F7FA]">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B9EFF] animate-ping absolute opacity-60" />
                <Loader2 className="w-3.5 h-3.5 text-[#3B9EFF] animate-spin relative" />
              </div>
              <span className="tracking-wide">Updating catalog...</span>
            </div>
          </div>
        )}

        {/* Content Container (Gracefully dims during transition) */}
        <div
          className={`transition-all duration-150 ${
            isBusy ? "opacity-35 blur-[0.5px] scale-[0.995] pointer-events-none" : "opacity-100"
          }`}
        >
          {activeCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl bg-[#151C27]/40 border border-white/[0.04] mt-2">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#6F7886] mb-3.5">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#F5F7FA]">No titles match your filters</h3>
              <p className="text-xs text-[#A8B0BD] max-w-xs sm:max-w-sm mt-1 leading-relaxed">
                No user-added titles match the selected format, platform, genre, or rating.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 px-4 py-2 rounded-xl bg-[#3B9EFF] hover:bg-[#2F8EEA] text-white text-xs font-semibold transition-all shadow-md shadow-[#3B9EFF]/20 cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-9 mt-1">
              {activeCategories.map((cat) => (
                <section key={cat.id} className="flex flex-col gap-3.5">
                  {/* Rating Category Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${cat.pillClass}`}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-[#F5F7FA] tracking-tight">
                            {cat.title}
                          </h2>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.pillClass}`}
                          >
                            {cat.items.length}
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs text-[#A8B0BD]">
                          {cat.description}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Media Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
                    {cat.items.map((item) => (
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
                        readOnly={true}
                        className="w-full"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
