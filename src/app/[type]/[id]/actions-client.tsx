"use client";

import { useState } from "react";
import { Plus, Check, Edit3, Play, X } from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { QuickAddModal } from "@/components/quick-add/quick-add-modal";
import { getRatingConfig } from "@/lib/rating";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { TrailerPlayer, TrailerVideo } from "@/components/media/trailer-player";

interface MediaDetailsActionsProps {
  media: NormalizedMedia;
  initialLog?: any;
  trailerKey?: string | null;
  trailerVideos?: TrailerVideo[];
  imdbId?: string | null;
}

export function MediaDetailsActions({
  media,
  initialLog,
  trailerKey,
  trailerVideos = [],
  imdbId,
}: MediaDetailsActionsProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);
  const [log, setLog] = useState(initialLog);

  // Lock background scroll when trailer cinema modal is open
  useScrollLock(isTrailerModalOpen);

  const ratingConfig = getRatingConfig(log?.rating);

  const resolvedVideos: TrailerVideo[] =
    trailerVideos.length > 0
      ? trailerVideos
      : trailerKey
      ? [{ key: trailerKey, name: "Official Trailer", type: "Trailer" }]
      : [];

  const hasTrailer = resolvedVideos.length > 0 || Boolean(imdbId);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Ratings Comparison Bar: IMDb vs CineTrack Personal Rating */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          {/* External IMDb Rating */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151C27] border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F7886]">
              IMDb
            </span>
            <span className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1">
              <span className="text-[#F5C84B]">★</span>
              {media.rating ? media.rating.toFixed(1) : "—"}
            </span>
          </div>

          {/* CineTrack Personal Rating */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151C27] border border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6F7886]">
              Your rating
            </span>
            {ratingConfig ? (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${ratingConfig.badgeClass}`}
              >
                {ratingConfig.label}
              </span>
            ) : (
              <span className="text-xs font-medium text-[#6F7886]">
                Not rated
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 max-w-lg w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Add / Status Button */}
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className="flex-1 sm:flex-initial h-10 px-4 bg-[#3B9EFF] text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md hover:bg-[#5AAFFF] active:scale-95 transition-all cursor-pointer"
          >
            {log?.status ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span className="capitalize">{log.status.replace("_", " ")}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Library</span>
              </>
            )}
          </button>

          {/* Watch Trailer Button (Hero) */}
          {hasTrailer && (
            <button
              type="button"
              onClick={() => setIsTrailerModalOpen(true)}
              className="h-10 px-3.5 rounded-lg bg-[#1A2330] hover:bg-[#253244] text-[#F5F7FA] border border-white/[0.1] hover:border-white/[0.2] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer group shrink-0"
              title="Watch Official Trailer & Clips"
            >
              <Play className="w-3.5 h-3.5 text-[#3B9EFF] fill-[#3B9EFF] group-hover:scale-110 transition-transform" />
              <span>Trailer</span>
            </button>
          )}

          {/* Rate Button */}
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className={`h-10 px-3.5 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 border active:scale-95 transition-all cursor-pointer shrink-0 ${
              ratingConfig
                ? `${ratingConfig.bgColor} ${ratingConfig.borderColor} ${ratingConfig.textColor} hover:brightness-110`
                : "bg-[#1A2330] text-[#F5F7FA] border-white/[0.08] hover:bg-[#1D2734]"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{ratingConfig ? ratingConfig.label : "Rate"}</span>
          </button>
        </div>
      </div>

      {/* Cinema Mode Trailer Modal */}
      {isTrailerModalOpen && hasTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overscroll-contain"
          onClick={() => setIsTrailerModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#151C27] rounded-2xl overflow-hidden border border-white/10 shadow-2xl p-4 sm:p-5 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <Play className="w-4 h-4 text-[#3B9EFF] fill-[#3B9EFF] shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-[#F5F7FA] truncate">
                  {media.title} — Official Trailer & Clips
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTrailerModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#A8B0BD] hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                title="Close Trailer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Responsive Player with fallbacks and clip switcher */}
            <TrailerPlayer
              title={media.title}
              videos={resolvedVideos}
              imdbId={imdbId}
              autoPlay
            />
          </div>
        </div>
      )}

      <QuickAddModal
        media={media}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialLog={log}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </>
  );
}
