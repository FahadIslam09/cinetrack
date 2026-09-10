"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Plus, Check } from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { QuickAddModal } from "../quick-add/quick-add-modal";

interface MediaCardProps {
  media: NormalizedMedia;
  status?: "watching" | "completed" | "plan_to_watch" | "on_hold" | "dropped";
  userRating?: number;
  userEpisodes?: number;
  onUpdate?: () => void;
}

export function MediaCard({
  media,
  status,
  userRating,
  userEpisodes,
  onUpdate,
}: MediaCardProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const detailUrl = `/${media.mediaType}/${media.source === "anilist" ? media.sourceId : media.sourceId}`;

  const statusBadges: Record<string, { label: string; color: string }> = {
    watching: { label: "WATCHING", color: "bg-[#3B9EFF]/90 text-white" },
    completed: { label: "COMPLETED", color: "bg-[#22C55E]/90 text-white" },
    plan_to_watch: { label: "PLAN TO WATCH", color: "bg-[#1E293B]/90 text-[#94A3B8]" },
    on_hold: { label: "ON HOLD", color: "bg-[#F59E0B]/90 text-white" },
    dropped: { label: "DROPPED", color: "bg-[#F43F5E]/90 text-white" },
  };
  const statusBadge = status ? statusBadges[status] : undefined;

  return (
    <>
      <div className="group relative flex flex-col w-full">
        {/* Poster Container (2:3 Aspect Ratio) */}
        <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-[#1D2734] border border-white/[0.04] shadow-md transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:border-white/[0.1]">
          <Link href={detailUrl} className="block w-full h-full">
            {media.posterPath ? (
              <img
                src={media.posterPath}
                alt={media.title}
                loading="lazy"
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#6F7886] p-2 text-center">
                No Poster
              </div>
            )}
          </Link>

          {/* Status Badge (Top Left) */}
          {statusBadge && (
            <span
              className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider backdrop-blur-sm shadow-sm ${statusBadge.color}`}
            >
              {statusBadge.label}
            </span>
          )}

          {/* Score Badge (Top Right) */}
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#0F141D]/80 backdrop-blur-md border border-white/[0.08] flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-[#F5C84B] text-[#F5C84B]" />
            <span className="text-[11px] font-bold text-[#F5C84B]">
              {userRating ? userRating.toFixed(1) : media.rating ? media.rating.toFixed(1) : "—"}
            </span>
          </div>

          {/* Quick Add Button (Bottom Right) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsQuickAddOpen(true);
            }}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-[#0F141D]/85 hover:bg-[#3B9EFF] border border-white/[0.1] text-white flex items-center justify-center shadow-lg transition-all active:scale-90"
            title="Quick Log"
          >
            {status === "completed" ? (
              <Check className="w-4 h-4 text-[#22C55E]" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Metadata Below Poster */}
        <div className="mt-2 flex flex-col">
          <Link
            href={detailUrl}
            className="font-semibold text-xs sm:text-sm text-[#F5F7FA] hover:text-[#3B9EFF] truncate transition-colors"
            title={media.title}
          >
            {media.title}
          </Link>
          <div className="flex items-center justify-between text-[11px] text-[#A8B0BD] mt-0.5">
            <span className="truncate">
              {media.year || "—"}
              {media.genres?.[0] ? ` • ${media.genres[0]}` : ` • ${media.mediaType}`}
            </span>
            {userEpisodes !== undefined && media.mediaType !== "movie" && (
              <span className="text-[#3B9EFF] font-semibold shrink-0 ml-1">
                E{userEpisodes}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        media={media}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialLog={{
          status,
          rating: userRating,
          episodesWatched: userEpisodes,
        }}
        onSuccess={() => {
          onUpdate?.();
        }}
      />
    </>
  );
}
