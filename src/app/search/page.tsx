"use client";

import { useState, useEffect, useCallback, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search as SearchIcon,
  X,
  Loader2,
  Users,
  Film,
  Tv,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Clapperboard,
} from "lucide-react";
import { useLenis } from "lenis/react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { MediaCard } from "@/components/media/media-card";
import { NormalizedMedia } from "@/lib/media/normalize";
import { ProfileSearchResult } from "@/app/api/search/route";

type FilterTab = "all" | "movie" | "series" | "anime" | "profiles";

interface SearchResponse {
  media: NormalizedMedia[];
  profiles: ProfileSearchResult[];
  pagination: {
    page: number;
    totalPages: number;
    totalMedia: number;
    totalProfiles: number;
  };
}

function MediaCardSkeleton() {
  return (
    <div className="w-full flex flex-col rounded-[14px] bg-[#121824] border border-white/[0.08] overflow-hidden">
      {/* Poster 2:3 with top-left badge and top-right rating pill */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#161E2C] skeleton-shimmer">
        {/* Top-Left Status Pill */}
        <div className="absolute top-2.5 left-2.5 h-5 w-16 rounded-full bg-black/60 border border-white/10" />
        {/* Top-Right Pill */}
        <div className="absolute top-2.5 right-2.5 h-5 w-10 rounded-full bg-black/60 border border-white/10" />
        {/* Bottom Vignette */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#121824] via-[#121824]/40 to-transparent pointer-events-none" />
      </div>

      {/* Card Content Section */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 relative z-10 bg-[#121824]">
        <div>
          {/* Title */}
          <div className="h-4 w-4/5 rounded bg-white/[0.08] skeleton-shimmer" />
          {/* Subtitle / Year • Format */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="h-3 w-8 rounded bg-white/[0.05] skeleton-shimmer" />
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="h-3 w-10 rounded bg-white/[0.05] skeleton-shimmer" />
          </div>
        </div>

        {/* Bottom Row: Tag Badge & Right Genre */}
        <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between gap-2">
          <div className="h-4 w-16 rounded-md bg-white/[0.06] skeleton-shimmer" />
          <div className="h-3 w-12 rounded bg-white/[0.04] skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lenis = useLenis();

  const urlQuery = searchParams.get("q") || "";
  const urlType = (searchParams.get("type") as FilterTab) || "all";
  const urlPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [inputValue, setInputValue] = useState(urlQuery);
  const [activeTab, setActiveTab] = useState<FilterTab>(urlType);
  const [currentPage, setCurrentPage] = useState(urlPage);

  const [data, setData] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Keep internal state in sync with URL
  useEffect(() => {
    setInputValue(urlQuery);
    setActiveTab(urlType);
    setCurrentPage(urlPage);
  }, [urlQuery, urlType, urlPage]);

  // Push URL changes
  const updateUrl = useCallback(
    (newQ: string, newType: FilterTab, newPage: number) => {
      const params = new URLSearchParams();
      if (newQ.trim()) params.set("q", newQ.trim());
      if (newType !== "all") params.set("type", newType);
      if (newPage > 1) params.set("page", newPage.toString());

      const targetUrl = params.toString() ? `/search?${params.toString()}` : "/search";
      startTransition(() => {
        router.push(targetUrl, { scroll: false });
      });
    },
    [router]
  );

  // Fetch results when url params change
  useEffect(() => {
    if (!urlQuery.trim()) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function fetchResults() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(urlQuery)}&type=${urlType}&page=${urlPage}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch search results");
        }

        const json: SearchResponse = await res.json();
        if (isMounted) {
          setData(json);
        }
      } catch (err: any) {
        if (err.name !== "AbortError" && isMounted) {
          setError(err.message || "An unexpected error occurred.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchResults();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [urlQuery, urlType, urlPage]);

  // Debounce input typing to URL
  useEffect(() => {
    if (inputValue === urlQuery) return;

    const timer = setTimeout(() => {
      updateUrl(inputValue, activeTab, 1);
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, urlQuery, activeTab, updateUrl]);

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    updateUrl(inputValue, tab, 1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrl(inputValue, activeTab, newPage);
    if (lenis) {
      lenis.scrollTo(0, { duration: 0.8 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const mediaList = data?.media || [];
  const profilesList = data?.profiles || [];
  const pagination = data?.pagination;

  const showProfiles =
    (activeTab === "all" || activeTab === "profiles") && profilesList.length > 0;
  const showMedia = activeTab !== "profiles" && mediaList.length > 0;

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-14">
      <AppHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Search Header Bar */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full">
            <div className="relative flex items-center w-full rounded-2xl bg-[#151C27] border border-white/[0.08] shadow-lg shadow-black/20 focus-within:border-[#3B9EFF] focus-within:ring-2 focus-within:ring-[#3B9EFF]/20 transition-all">
              <SearchIcon className="w-5 h-5 text-[#A8B0BD] ml-4 shrink-0" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search movies, TV shows, anime, or @usernames..."
                className="w-full bg-transparent px-3.5 py-4 text-sm sm:text-base text-[#F5F7FA] placeholder-[#6F7886] focus:outline-none"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => {
                    setInputValue("");
                    updateUrl("", activeTab, 1);
                  }}
                  className="p-2 text-[#A8B0BD] hover:text-white transition-colors mr-1 rounded-lg hover:bg-white/[0.05]"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {isLoading && (
                <Loader2 className="w-5 h-5 text-[#3B9EFF] animate-spin mr-4 shrink-0" />
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "all", label: "All Formats" },
              { id: "movie", label: "Movies" },
              { id: "series", label: "TV Shows" },
              { id: "anime", label: "Anime" },
              { id: "profiles", label: "Profiles" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              let count: number | null = null;
              if (data) {
                if (tab.id === "profiles") count = pagination?.totalProfiles || 0;
                else if (tab.id === "all")
                  count = (pagination?.totalMedia || 0) + (pagination?.totalProfiles || 0);
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as FilterTab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all outline-none focus:outline-none focus-visible:outline-none select-none border ${
                    isActive
                      ? "bg-[#3B9EFF] text-white border-[#3B9EFF] shadow-md shadow-[#3B9EFF]/25 font-semibold"
                      : "bg-[#151C27] text-[#A8B0BD] hover:text-[#F5F7FA] border-white/[0.06] hover:border-white/[0.14] hover:bg-[#1A2230]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {count !== null && count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white/[0.08] text-[#A8B0BD]"
                      }`}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata Header */}
        {urlQuery.trim() && !isLoading && data && (
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs sm:text-sm text-[#A8B0BD]">
            <div>
              Results for{" "}
              <span className="text-[#F5F7FA] font-semibold">&ldquo;{urlQuery}&rdquo;</span>
              {pagination && (
                <span className="ml-1.5 text-[#6F7886]">
                  ({pagination.totalMedia + pagination.totalProfiles} found)
                </span>
              )}
            </div>
            {pagination && pagination.totalPages > 1 && activeTab !== "profiles" && (
              <span className="text-[#6F7886] text-xs">
                Page {pagination.page} of {pagination.totalPages}
              </span>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-[#F5F7FA] font-medium text-sm">{error}</p>
            <button
              onClick={() => updateUrl(urlQuery, activeTab, currentPage)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#151C27] text-[#3B9EFF] border border-white/[0.08] hover:bg-[#1A2230] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-6">
            {/* Profiles Skeleton (if relevant) */}
            {(activeTab === "all" || activeTab === "profiles") && (
              <div className="flex flex-col gap-3">
                <div className="w-24 h-4 rounded bg-white/[0.08] skeleton-shimmer" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#151C27] border border-white/[0.04] skeleton-shimmer"
                    >
                      <div className="w-11 h-11 rounded-full bg-white/[0.08] shrink-0" />
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="w-24 h-3.5 rounded bg-white/[0.08]" />
                        <div className="w-16 h-2.5 rounded bg-white/[0.05]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Grid Skeleton */}
            {activeTab !== "profiles" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <MediaCardSkeleton key={idx} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content View */}
        {!isLoading && !error && data && (
          <div className="flex flex-col gap-8">
            {/* 1. User Profiles Section */}
            {showProfiles && (
              <section className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#3B9EFF]" />
                    <h2 className="text-sm sm:text-base font-bold text-[#F5F7FA]">
                      Profiles
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A8B0BD] border border-white/[0.06]">
                      {profilesList.length}
                    </span>
                  </div>

                  {activeTab === "all" && profilesList.length > 3 && (
                    <button
                      onClick={() => handleTabChange("profiles")}
                      className="text-xs text-[#3B9EFF] hover:underline"
                    >
                      View all profiles
                    </button>
                  )}
                </div>

                <div
                  className={
                    activeTab === "profiles"
                      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  }
                >
                  {profilesList.map((profile) => (
                    <Link
                      key={profile.id}
                      href={`/u/${profile.username}`}
                      className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#151C27] border border-white/[0.06] hover:bg-[#1A2230] hover:border-white/[0.12] transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1A2230] border border-white/[0.08] flex items-center justify-center shrink-0">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.fullName || profile.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-[#3B9EFF]">
                            {(profile.fullName || profile.username)[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-[#F5F7FA] truncate group-hover:text-[#3B9EFF] transition-colors">
                          {profile.fullName || profile.username}
                        </span>
                        <span className="text-xs text-[#A8B0BD] truncate">
                          @{profile.username}
                        </span>
                        {profile.bio && (
                          <p className="text-[11px] text-[#6F7886] truncate mt-0.5">
                            {profile.bio}
                          </p>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#6F7886] group-hover:text-[#3B9EFF] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Media Results Section */}
            {showMedia && (
              <section className="flex flex-col gap-3.5">
                {activeTab === "all" && showProfiles && (
                  <div className="flex items-center gap-2 border-t border-white/[0.06] pt-6">
                    <Film className="w-4 h-4 text-[#3B9EFF]" />
                    <h2 className="text-sm sm:text-base font-bold text-[#F5F7FA]">
                      Titles & Media
                    </h2>
                    {pagination && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A8B0BD] border border-white/[0.06]">
                        {pagination.totalMedia}
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
                  {mediaList.map((item) => (
                    <MediaCard
                      key={item.id}
                      media={item}
                      className="w-full"
                    />
                  ))}
                </div>

                {/* Minimal Compact Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-8 pb-4">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2.5 rounded-xl bg-[#151C27] border border-white/[0.06] hover:border-white/[0.14] text-[#A8B0BD] hover:text-white hover:bg-[#1A2330] disabled:opacity-40 disabled:pointer-events-none transition-all outline-none focus:outline-none focus-visible:outline-none select-none"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
                        (_, idx) => {
                          let pageNum: number;
                          if (pagination.totalPages <= 5) {
                            pageNum = idx + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = idx + 1;
                          } else if (pagination.page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + idx;
                          } else {
                            pageNum = pagination.page - 2 + idx;
                          }

                          const isCurrent = pageNum === pagination.page;

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all outline-none focus:outline-none focus-visible:outline-none select-none border ${
                                isCurrent
                                  ? "bg-[#3B9EFF] text-white border-[#3B9EFF] shadow-md shadow-[#3B9EFF]/25"
                                  : "bg-[#151C27] text-[#A8B0BD] hover:text-white border-white/[0.06] hover:border-white/[0.14] hover:bg-[#1A2230]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2.5 rounded-xl bg-[#151C27] border border-white/[0.06] hover:border-white/[0.14] text-[#A8B0BD] hover:text-white hover:bg-[#1A2330] disabled:opacity-40 disabled:pointer-events-none transition-all outline-none focus:outline-none focus-visible:outline-none select-none"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Empty Results within Search */}
            {!showProfiles && !showMedia && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#151C27] border border-white/[0.06] flex items-center justify-center text-[#6F7886] mb-3">
                  <SearchIcon className="w-6 h-6" />
                </div>
                <p className="text-[#F5F7FA] font-semibold text-base">
                  No results found for &ldquo;{urlQuery}&rdquo;
                </p>
                <p className="text-[#A8B0BD] text-xs sm:text-sm mt-1 max-w-sm">
                  Check your spelling, search for a different title or handle, or switch the category filter tab.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Initial Empty Query State */}
        {!urlQuery.trim() && (
          <div className="py-24 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#151C27] border border-white/[0.06] flex items-center justify-center text-[#3B9EFF] shadow-lg">
              <Clapperboard className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#F5F7FA]">
              Search CineTrack
            </h3>
            <p className="text-[#A8B0BD] text-xs sm:text-sm max-w-md">
              Find movies, television series, anime releases, or cinephile profiles across the entire community catalog.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-md">
              {["Oppenheimer", "Severance", "Attack on Titan", "fahad", "Dune"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInputValue(suggestion);
                    updateUrl(suggestion, activeTab, 1);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151C27] text-[#A8B0BD] hover:text-[#3B9EFF] hover:border-[#3B9EFF]/40 border border-white/[0.06] transition-colors outline-none focus:outline-none focus-visible:outline-none select-none"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-14">
          <AppHeader />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 flex flex-col gap-6">
            <div className="w-full h-14 rounded-2xl bg-[#151C27] border border-white/[0.08] skeleton-shimmer" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-24 h-9 rounded-xl bg-[#151C27] border border-white/[0.06] skeleton-shimmer"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4 mt-2">
              {Array.from({ length: 12 }).map((_, idx) => (
                <MediaCardSkeleton key={idx} />
              ))}
            </div>
          </main>
          <BottomNav />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
