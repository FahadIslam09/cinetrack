"use client";

import { Film } from "lucide-react";

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
  if (!videos.length && !imdbId) return null;

  const currentVideo = videos[0];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* 16:9 Player Container */}
      {currentVideo ? (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-black shadow-2xl">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.key}?rel=0${autoPlay ? "&autoplay=1" : ""}`}
            title={`${title}: ${currentVideo.name}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} official trailer`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="aspect-video w-full rounded-2xl border border-white/[0.08] bg-[#101622] hover:bg-[#151C27] flex flex-col items-center justify-center p-6 text-center gap-2 transition group"
        >
          <Film className="w-10 h-10 text-[#F5C84B] group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-sm font-bold text-[#F5F7FA]">Watch Official Trailer</p>
            <p className="text-xs text-[#A8B0BD] mt-0.5">
              Watch trailer on YouTube
            </p>
          </div>
        </a>
      )}
    </div>
  );
}
