"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Search as SearchIcon, X, ArrowLeft, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { MediaCard } from "@/components/media/media-card";
import { NormalizedMedia } from "@/lib/media/normalize";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "series" | "anime">("all");
  const [results, setResults] = useState<NormalizedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${activeTab}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-12">
      <AppHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-20 flex flex-col gap-4">
        {/* Search Bar Input */}
        <div className="relative w-full">
          <div className="relative flex items-center w-full rounded-xl bg-[#151C27] border border-white/[0.08] shadow-md focus-within:border-[#3B9EFF] transition-colors">
            <SearchIcon className="w-5 h-5 text-[#A8B0BD] ml-3.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows, anime..."
              autoFocus
              className="w-full bg-transparent px-3 py-3.5 text-sm text-[#F5F7FA] placeholder-[#6F7886] focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-2 text-[#A8B0BD] hover:text-white mr-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isLoading && (
              <Loader2 className="w-4 h-4 text-[#3B9EFF] animate-spin mr-3.5 shrink-0" />
            )}
          </div>
        </div>

        {/* Media Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "all", label: "All Formats" },
            { id: "movie", label: "Movies" },
            { id: "series", label: "TV Shows" },
            { id: "anime", label: "Anime" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[#3B9EFF] text-white"
                  : "bg-[#151C27] text-[#A8B0BD] hover:text-white border border-white/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results View */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mt-2">
            {results.map((item) => (
              <MediaCard key={item.id} media={item} className="w-full" />
            ))}
          </div>
        ) : query.trim() && !isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <p className="text-[#F5F7FA] font-semibold text-base">
              No results found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-[#A8B0BD] text-xs mt-1">
              Try searching with another spelling or switch the category filter.
            </p>
          </div>
        ) : !query.trim() ? (
          <div className="py-20 flex flex-col items-center justify-center text-center text-[#6F7886] text-xs">
            Type anything above to search across TMDb and AniList catalogs.
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}
