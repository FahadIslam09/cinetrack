"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Info, Star, Check } from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { QuickAddModal } from "../quick-add/quick-add-modal";

interface HeroBannerProps {
  media: NormalizedMedia;
  userStatus?: string;
  userRating?: number;
}

export function HeroBanner({ media, userStatus, userRating }: HeroBannerProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const detailUrl = `/${media.mediaType}/${media.sourceId}`;
  const backdropUrl = media.backdropPath || media.posterPath || "/placeholder-backdrop.png";

  return (
    <>
      <section className="relative w-full overflow-hidden bg-[#151C27] border-b border-white/[0.06]">
        {/* Atmospheric Backdrop */}
        <div
          className="w-full h-80 sm:h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url('${backdropUrl}')` }}
        >
          {/* Directional Gradient Scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-[#0F141D]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F141D]/80 via-transparent to-transparent" />
        </div>

        {/* Hero Content Overlay */}
        <div className="max-w-7xl mx-auto px-4 -mt-36 relative z-10 pb-6 flex flex-col gap-3">
          <div className="flex items-end gap-3.5">
            {/* 2:3 Vertical Miniature Poster */}
            <div className="w-24 sm:w-32 aspect-[2/3] shrink-0 rounded-lg overflow-hidden shadow-2xl bg-[#1D2734] border border-white/[0.1] relative">
              {media.posterPath ? (
                <img
                  src={media.posterPath}
                  alt={media.title}
                  className="w-full h-full object-cover"
                />
              ) : null}
              <span className="absolute top-1 left-1 bg-[#0F141D]/80 backdrop-blur-sm text-[#F5C84B] px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-[#F5C84B]" />
                {media.rating ? media.rating.toFixed(1) : "—"}
              </span>
            </div>

            {/* Badges & Title */}
            <div className="flex flex-col justify-end min-w-0 pb-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1 text-xs">
                <span className="bg-[#3B9EFF]/20 text-[#3B9EFF] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                  Featured
                </span>
                <span className="text-[#6F7886] font-medium">{media.year || "2024"}</span>
                <span className="text-[#4B5563]">•</span>
                {media.runtime && (
                  <>
                    <span className="text-[#6F7886] font-medium">
                      {Math.floor(media.runtime / 60)}h {media.runtime % 60}m
                    </span>
                    <span className="text-[#4B5563]">•</span>
                  </>
                )}
                <span className="text-[#A8B0BD] font-semibold">
                  {media.genres?.[0] || "Cinema"}
                </span>
              </div>

              <h1 className="font-extrabold text-xl sm:text-3xl tracking-tight text-[#F5F7FA] truncate">
                {media.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#A8B0BD] line-clamp-2 mt-1 leading-relaxed max-w-xl">
                {media.synopsis ||
                  "Experience cinematic storytelling crafted with atmospheric visuals, deep characters, and unforgettable direction."}
              </p>
            </div>
          </div>

          {/* Action Button Group */}
          <div className="flex items-center gap-2 pt-1 max-w-md">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="flex-1 h-11 bg-[#3B9EFF] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 shadow-md hover:bg-[#5AAFFF] active:scale-95 transition-all"
            >
              {userStatus ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="capitalize">{userStatus}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Library</span>
                </>
              )}
            </button>

            <Link
              href={detailUrl}
              className="h-11 px-5 bg-[#1A2330] text-[#F5F7FA] rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-[#1D2734] border border-white/[0.08] active:scale-95 transition-all"
            >
              <Info className="w-4 h-4 text-[#A8B0BD]" />
              <span>Details</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Add Modal */}
      <QuickAddModal
        media={media}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialLog={{
          status: userStatus,
          rating: userRating,
        }}
      />
    </>
  );
}
