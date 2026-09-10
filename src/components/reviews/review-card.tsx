"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Heart, MessageSquare, AlertTriangle } from "lucide-react";

export interface ReviewCardProps {
  author: {
    name: string;
    avatarUrl?: string;
    isVerified?: boolean;
    role?: string;
    roleColor?: string;
  };
  mediaTitle: string;
  mediaHref?: string;
  editionTag?: string;
  rating?: number;
  reviewText: string;
  bengaliQuote?: string;
  containsSpoilers?: boolean;
  likesCount?: number;
  commentsCount?: number;
  timeAgo?: string;
  isBengali?: boolean;
  seriesTag?: string;
}

export function ReviewCard({
  author,
  mediaTitle,
  mediaHref,
  editionTag,
  rating,
  reviewText,
  bengaliQuote,
  containsSpoilers = false,
  likesCount = 0,
  commentsCount = 0,
  timeAgo = "2 hours ago",
  isBengali = false,
  seriesTag,
}: ReviewCardProps) {
  const [revealed, setRevealed] = useState(!containsSpoilers);
  const [likes, setLikes] = useState(likesCount);
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const roleText =
    author.role || (author.isVerified ? "Staff Critic" : "Verified");

  const badgeBg =
    author.role === "Staff Critic" || author.role === "STAFF CRITIC"
      ? "bg-[#3B9EFF]/15 text-[#3B9EFF]"
      : author.role === "Verified" || author.role === "VERIFIED MEMBER" || author.isVerified
      ? "bg-[#22C55E]/15 text-[#22C55E]"
      : "bg-[#252A34] text-[#A8B0BD]";

  return (
    <div className="flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-[#1D2734] hover:bg-[#1A2330] border border-white/[0.06] transition-colors gap-3.5 shadow-sm">
      <div>
        {/* Critic Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 shrink-0 bg-[#151C27]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#3B9EFF]/20 border border-[#3B9EFF]/30 flex items-center justify-center text-xs font-bold text-[#3B9EFF] shrink-0">
                {author.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-sm text-[#F5F7FA] leading-tight truncate">
                  {author.name}
                </h4>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeBg}`}>
                  {roleText}
                </span>
              </div>
              <p className="text-[11px] text-[#6F7886] mt-0.5 truncate">
                Reviewed {mediaTitle} {editionTag ? `(${editionTag})` : ""}
              </p>
            </div>
          </div>

          {rating !== undefined && (
            <span className="text-[#F5C84B] font-bold text-xs sm:text-sm flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#F5C84B] text-[#F5C84B]" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>



        {/* Optional Bengali Typography Quote */}
        {bengaliQuote && (
          <p className="font-bengali text-sm sm:text-[15px] text-[#F5F7FA] mb-2 leading-relaxed font-medium">
            "{bengaliQuote}"
          </p>
        )}

        {/* Review Body with Spoiler Guard */}
        {containsSpoilers && !revealed ? (
          <div className="relative rounded-lg overflow-hidden min-h-[90px] flex items-center justify-center">
            <p className="blur-md select-none pointer-events-none text-xs sm:text-sm text-[#A8B0BD] leading-relaxed">
              {reviewText}
            </p>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F141D]/80 backdrop-blur-sm p-3 text-center z-10 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] mb-1 shrink-0" />
              <span className="text-xs font-bold text-[#F5F7FA]">
                Contains Narrative Spoilers
              </span>
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-2 px-3 py-1 rounded bg-[#1A2330] hover:bg-[#253244] text-[#F5F7FA] text-[11px] font-bold transition-colors border border-white/[0.08] cursor-pointer"
              >
                Tap to Reveal
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`text-xs sm:text-sm text-[#A8B0BD] leading-relaxed ${
              isBengali ? "font-bengali text-[15px] leading-7 text-[#F5F7FA]" : ""
            }`}
          >
            {reviewText}
          </p>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 mt-auto border-t border-white/[0.06] flex items-center justify-between text-xs text-[#6F7886]">
        <div className="flex items-center gap-2">
          {seriesTag ? (
            <span className="text-[11px] font-medium text-[#A8B0BD]">{seriesTag}</span>
          ) : (
            <span>{timeAgo}</span>
          )}
        </div>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={toggleLike}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${
              liked ? "text-[#F43F5E]" : "hover:text-[#F5F7FA]"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-[#F43F5E]" : ""}`} />
            <span>{likes}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 hover:text-[#F5F7FA] transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentsCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

