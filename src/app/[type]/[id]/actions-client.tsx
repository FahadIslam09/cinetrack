"use client";

import { useState } from "react";
import { Plus, Check, Edit3 } from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { QuickAddModal } from "@/components/quick-add/quick-add-modal";
import { getRatingConfig } from "@/lib/rating";

interface MediaDetailsActionsProps {
  media: NormalizedMedia;
  initialLog?: any;
}

export function MediaDetailsActions({
  media,
  initialLog,
}: MediaDetailsActionsProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [log, setLog] = useState(initialLog);

  const ratingConfig = getRatingConfig(log?.rating);

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
        <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
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

          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className={`h-10 px-3.5 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 border active:scale-95 transition-all cursor-pointer ${
              ratingConfig
                ? `${ratingConfig.bgColor} ${ratingConfig.borderColor} ${ratingConfig.textColor} hover:brightness-110`
                : "bg-[#1A2330] text-[#F5F7FA] border-white/[0.08] hover:bg-[#1D2734]"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{ratingConfig ? ratingConfig.label : "Rate this title"}</span>
          </button>
        </div>
      </div>

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
