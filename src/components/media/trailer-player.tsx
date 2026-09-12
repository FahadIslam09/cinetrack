"use client";

import { useState } from "react";
import { ExternalLink, Search, Film } from "lucide-react";

export interface TrailerVideo {
  key: string;
  name: string;
  type: string;
}

interface TrailerPlayerProps {
  title: string;
  videos: TrailerVideo[];
  imdbId?: string | null;
  className?: string;
  autoPlay?: boolean;
}

export function TrailerPlayer({
  title,
  videos,
  imdbId,
  className = "",
  autoPlay = false,
}: TrailerPlayerProps) {
  const [selectedKey, setSelectedKey] = useState<string>(videos[0]?.key || "");

  if (!videos.length && !imdbId) return null;

  const currentVideo = videos.find((v) => v.key === selectedKey) || videos[0];
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " official trailer")}`;
  const imdbVideoUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/videogallery/` : null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* 16:9 Player Container */}
      {currentVideo ? (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-black shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.key}?rel=0${autoPlay ? "&autoplay=1" : ""}`}
            title={`${title} — ${currentVideo.name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-2xl border border-white/[0.08] bg-[#101622] flex flex-col items-center justify-center p-6 text-center gap-2">
          <Film className="w-10 h-10 text-[#6F7886]" />
          <div>
            <p className="text-sm font-semibold text-[#F5F7FA]">Embedded trailer unavailable</p>
            <p className="text-xs text-[#6F7886] mt-0.5">
              Watch unrestricted trailer directly on IMDb or search YouTube below.
            </p>
          </div>
        </div>
      )}

      {/* Video switcher & Fallback Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5">
        {/* Alternate Video Pills (if multiple videos available) */}
        {videos.length > 1 ? (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-[#6F7886] uppercase tracking-wider shrink-0 mr-1">
              Clips:
            </span>
            {videos.slice(0, 5).map((v) => {
              const isSelected = v.key === currentVideo?.key;
              return (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setSelectedKey(v.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#3B9EFF] text-white shadow-sm"
                      : "bg-[#151C27] hover:bg-[#1D2734] text-[#A8B0BD] border border-white/[0.06]"
                  }`}
                  title={v.name}
                >
                  {v.type || "Video"}
                </button>
              );
            })}
          </div>
        ) : (
          <div />
        )}

        {/* Fallback Buttons: Watch on IMDb & Search YouTube */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {imdbVideoUrl && (
            <a
              href={imdbVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg bg-[#F5C84B]/15 hover:bg-[#F5C84B]/25 border border-[#F5C84B]/30 text-[#F5C84B] text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
              title="Watch unrestricted video on IMDb"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Watch on IMDb</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 px-3 rounded-lg bg-[#151C27] hover:bg-[#1D2734] border border-white/[0.08] text-[#A8B0BD] hover:text-[#F5F7FA] text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
            title="Search YouTube for region-free uploads"
          >
            <Search className="w-3 h-3 text-[#FF0000]" />
            <span>Search YouTube</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
}
