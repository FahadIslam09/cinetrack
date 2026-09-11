"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Plus, Loader2, Film } from "lucide-react";
import { incrementEpisode } from "@/actions/tracking";

interface ContinueWatchingCardProps {
  mediaId: string;
  sourceId: string;
  mediaType: "series" | "anime" | "movie";
  title: string;
  episodeName?: string;
  backdropPath?: string | null;
  posterPath?: string | null;
  currentEpisode: number;
  totalEpisodes: number;
  seasonNumber?: number;
  network?: string;
  onIncrement?: () => void;
}

export function ContinueWatchingCard({
  mediaId,
  sourceId,
  mediaType,
  title,
  episodeName,
  backdropPath,
  posterPath,
  currentEpisode: initialEpisode,
  totalEpisodes,
  seasonNumber = 1,
  network,
  onIncrement,
}: ContinueWatchingCardProps) {
  const [episode, setEpisode] = useState(initialEpisode);
  const [loading, setLoading] = useState(false);
  const [loggedAnim, setLoggedAnim] = useState(false);

  const percentage =
    totalEpisodes > 0
      ? Math.min(100, Math.round((episode / totalEpisodes) * 100))
      : 50;

  const imageSrc =
    posterPath || backdropPath || "https://image.tmdb.org/t/p/w342/abf8tHznhSvl9BAElD23cQaeCDW.jpg";

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const prev = episode;
    const nextEp = prev + 1;
    setEpisode(nextEp); // optimistic
    setLoggedAnim(true);
    setTimeout(() => setLoggedAnim(false), 1400);

    try {
      const res = await incrementEpisode(mediaId, totalEpisodes);
      if (res.error) {
        setEpisode(prev); // rollback
      } else {
        onIncrement?.();
      }
    } catch {
      setEpisode(prev);
    } finally {
      setLoading(false);
    }
  };

  const badgeText =
    mediaType === "anime" ? "ANIME" : mediaType === "series" ? "TV" : "FILM";
  const platformText =
    network ||
    (mediaType === "anime"
      ? "Crunchyroll"
      : title.toLowerCase().includes("severance")
      ? "Apple TV+"
      : title.toLowerCase().includes("shōgun") || title.toLowerCase().includes("shogun")
      ? "FX / Hulu"
      : "Streaming");

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-[#1D2734] hover:bg-[#1A2330] border border-white/[0.06] transition-all group min-w-[280px] max-w-[280px] sm:max-w-none sm:min-w-0 snap-start shrink-0 sm:shrink">
      {/* Media Poster with Badge */}
      <Link
        href={`/${mediaType}/${sourceId}`}
        className="relative w-20 aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-[#151C27] block"
      >
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.classList.remove("hidden");
          }}
        />
        <div className="w-full h-full bg-[#151C27] hidden items-center justify-center text-[#6F7886]">
          <Film className="w-6 h-6 text-white/10" />
        </div>
        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-[#090E17]/85 backdrop-blur text-[9px] font-bold text-white uppercase tracking-wider">
          {badgeText}
        </span>
      </Link>

      {/* Content & Progress Controls */}
      <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
        {/* Top Info */}
        <div>
          {/* Mobile Top Meta: Network + Percentage */}
          <div className="flex sm:hidden items-center justify-between gap-1 mb-0.5">
            <span className="text-[11px] text-[#6F7886] font-medium truncate">{platformText}</span>
            <span className="text-[11px] text-[#3B9EFF] font-bold">{percentage}%</span>
          </div>

          <Link
            href={`/${mediaType}/${sourceId}`}
            className="font-bold text-sm text-[#F5F7FA] hover:text-[#3B9EFF] transition-colors truncate block"
          >
            {title}
          </Link>
          <p className="text-xs text-[#A8B0BD] mt-0.5 truncate">
            {episodeName || `Season ${seasonNumber} · Episode ${episode}`}
          </p>
        </div>

        {/* Bottom Section */}
        <div className="mt-2 space-y-2">
          {/* Desktop/Tablet Progress Numbers */}
          <div className="hidden sm:flex items-center justify-between text-[11px] font-medium text-[#A8B0BD]">
            <span>Ep {episode} of {totalEpisodes || "10"}</span>
            <span className="text-[#3B9EFF] font-bold">{percentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 sm:h-1.5 rounded-full bg-[#151C27] overflow-hidden">
            <div
              className="h-full bg-[#3B9EFF] rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Mobile Full-Width Button */}
          <div className="sm:hidden pt-0.5">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={loading}
              className={`w-full h-7 rounded text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                loggedAnim
                  ? "bg-[#22C55E]/20 text-[#22C55E]"
                  : "bg-[#252A34] hover:bg-[#343943] text-[#F5F7FA]"
              }`}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : loggedAnim ? (
                <span>✓ Logged</span>
              ) : (
                <span>+1 Ep</span>
              )}
            </button>
          </div>

          {/* Tablet/Desktop Network & Button Row */}
          <div className="hidden sm:flex items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
            <span className="text-xs text-[#A8B0BD] truncate min-w-0">
              {platformText}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={loading}
              className={`h-7 px-2.5 rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0 ${
                loggedAnim
                  ? "bg-[#22C55E]/20 text-[#22C55E]"
                  : "bg-[#151C27] hover:bg-[#3B9EFF] text-[#3B9EFF] hover:text-white"
              }`}
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : loggedAnim ? (
                <span>✓ Logged</span>
              ) : (
                <span>✓ +1 Ep</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
