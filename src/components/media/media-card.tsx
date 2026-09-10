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
  badgeLabel?: string;
  className?: string;
  onUpdate?: () => void;
}

export function MediaCard({
  media,
  status,
  userRating,
  badgeLabel,
  className,
  onUpdate,
}: MediaCardProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const detailUrl = `/${media.mediaType}/${media.source === "anilist" ? media.sourceId : media.sourceId}`;

  const statusLabel =
    badgeLabel ||
    (status === "completed"
      ? "Watched"
      : status === "watching"
      ? "Watching"
      : status === "plan_to_watch"
      ? "Plan"
      : "Unlogged");

  const statusColor =
    status === "completed"
      ? "text-[#22C55E]"
      : status === "watching"
      ? "text-[#3B9EFF]"
      : status === "plan_to_watch"
      ? "text-[#94A3B8]"
      : "text-[#6F7886]";

  const formatText =
    media.mediaType === "movie"
      ? "Film"
      : media.mediaType === "anime"
      ? "Anime"
      : "TV";

  return (
    <>
      <div className={`${className || "w-[140px] sm:w-[160px] lg:w-[168px] shrink-0"} group flex flex-col cursor-pointer snap-start`}>
        {/* Poster Container (2:3 Aspect Ratio) */}
        <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#1D2734] border border-white/[0.04] mb-2 shadow-sm transition-all group-hover:border-white/[0.12]">
          <Link href={detailUrl} className="block w-full h-full">
            {media.posterPath ? (
              <img
                src={media.posterPath}
                alt={media.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#6F7886] p-2 text-center">
                No Poster
              </div>
            )}
          </Link>

          {/* Quick Hover Overlay from code.html */}
          <div className="absolute inset-0 bg-[#0F141D]/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none group-hover:pointer-events-auto">
            {/* Top Status Pill */}
            <span
              className={`self-end px-1.5 py-0.5 rounded bg-[#0F141D]/90 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}
            >
              {statusLabel}
            </span>

            {/* Center Quick Actions */}
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickAddOpen(true);
                }}
                className="w-8 h-8 rounded-full bg-[#1A2330] hover:bg-[#253244] border border-white/[0.08] text-[#F5C84B] flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md"
                title="Rate"
              >
                <Star className="w-4 h-4 fill-[#F5C84B]" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickAddOpen(true);
                }}
                className="w-8 h-8 rounded-full bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-md"
                title="Quick Log"
              >
                {status === "completed" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Bottom Status Text */}
            <span className="text-center text-[10px] text-[#A8B0BD] truncate">
              {status === "completed" ? "Logged" : "+ Quick Log"}
            </span>
          </div>

          {/* Top Status & Score Pills */}
          {status && (
            <div
              className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#0F141D]/90 backdrop-blur text-[9px] font-bold uppercase tracking-wider ${statusColor} border border-white/[0.06] z-10 pointer-events-none`}
            >
              {statusLabel}
            </div>
          )}

          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#0F141D]/90 backdrop-blur font-bold text-[10px] flex items-center gap-0.5 pointer-events-none shadow-sm border border-white/[0.06] z-10">
            <Star
              className={`w-3 h-3 ${
                userRating ? "fill-[#F5C84B] text-[#F5C84B]" : "fill-[#F5C84B]/70 text-[#F5C84B]/70"
              }`}
            />
            <span className={userRating ? "text-[#F5C84B]" : "text-[#F5F7FA]"}>
              {userRating
                ? userRating.toFixed(1)
                : media.rating
                ? media.rating.toFixed(1)
                : "—"}
            </span>
          </div>
        </div>

        {/* Metadata Below Poster */}
        <Link
          href={detailUrl}
          className="font-semibold text-xs sm:text-sm text-[#F5F7FA] hover:text-[#3B9EFF] truncate transition-colors"
          title={media.title}
        >
          {media.title}
        </Link>
        <div className="flex items-center justify-between text-[11px] font-medium mt-0.5 text-[#6F7886]">
          <span className="truncate">
            {media.year || "2024"} · {formatText}
          </span>
          {userRating && (
            <span className="text-[10px] text-[#A8B0BD] font-medium shrink-0">
              You: <strong className="text-[#F5C84B]">★ {userRating.toFixed(1)}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        media={media}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={onUpdate}
      />
    </>
  );
}
