"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, Loader2 } from "lucide-react";
import { incrementEpisode } from "@/actions/tracking";

interface ContinueWatchingCardProps {
  mediaId: string;
  sourceId: string;
  mediaType: "series" | "anime";
  title: string;
  episodeName?: string;
  backdropPath?: string | null;
  posterPath?: string | null;
  currentEpisode: number;
  totalEpisodes: number;
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
  onIncrement,
}: ContinueWatchingCardProps) {
  const [episode, setEpisode] = useState(initialEpisode);
  const [loading, setLoading] = useState(false);

  const percentage = totalEpisodes > 0 ? Math.min(100, Math.round((episode / totalEpisodes) * 100)) : 50;

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const prev = episode;
    setEpisode(prev + 1); // optimistic

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

  const imageSrc = backdropPath || posterPath || "/placeholder-backdrop.png";

  return (
    <div className="w-64 sm:w-72 shrink-0 flex flex-col rounded-xl overflow-hidden bg-[#151C27] border border-white/[0.06] shadow-md group">
      {/* 16:9 Media Preview */}
      <Link
        href={`/${mediaType}/${sourceId}`}
        className="relative aspect-[16/9] w-full overflow-hidden bg-[#1D2734] block"
      >
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-transparent to-transparent" />

        {/* In Progress Tag */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#3B9EFF]/90 backdrop-blur-md text-[10px] font-bold tracking-wider text-white shadow-sm">
          IN PROGRESS
        </span>

        {/* Episode Progress Indicator */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-white/90">
          <span>
            Ep {episode} / {totalEpisodes || "∞"}
          </span>
          <span className="text-white/70">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-[#3B9EFF] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </Link>

      {/* Metadata & Quick Action */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/${mediaType}/${sourceId}`}
            className="font-semibold text-sm text-[#F5F7FA] hover:text-[#3B9EFF] truncate block transition-colors"
          >
            {title}
          </Link>
          <p className="text-xs text-[#A8B0BD] truncate mt-0.5">
            {episodeName || `Episode ${episode}`}
          </p>
        </div>

        {/* + 1 Ep Quick Increment Button */}
        <button
          onClick={handleIncrement}
          disabled={loading || (totalEpisodes > 0 && episode >= totalEpisodes)}
          className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-[#3B9EFF] border border-white/[0.08] text-xs font-semibold text-white flex items-center gap-1 shrink-0 transition-all active:scale-95 disabled:opacity-40"
          title="Add watched episode"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : episode >= totalEpisodes && totalEpisodes > 0 ? (
            <Check className="w-3.5 h-3.5 text-[#22C55E]" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>+ 1 Ep</span>
        </button>
      </div>
    </div>
  );
}
