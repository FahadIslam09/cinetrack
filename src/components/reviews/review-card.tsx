"use client";

import { useState } from "react";
import { Star, Heart, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ReviewCardProps {
  author: {
    name: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  mediaTitle: string;
  rating?: number;
  reviewText: string;
  containsSpoilers?: boolean;
  likesCount?: number;
  commentsCount?: number;
  timeAgo?: string;
  isBengali?: boolean;
}

export function ReviewCard({
  author,
  mediaTitle,
  rating,
  reviewText,
  containsSpoilers = false,
  likesCount = 0,
  commentsCount = 0,
  timeAgo = "2 hours ago",
  isBengali = false,
}: ReviewCardProps) {
  const [revealed, setRevealed] = useState(!containsSpoilers);
  const [likes, setLikes] = useState(likesCount);
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <div className="w-full p-4 rounded-xl bg-[#151C27] border border-white/[0.06] shadow-sm flex flex-col gap-3">
      {/* Author & Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {author.avatarUrl ? (
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#3B9EFF]/20 border border-[#3B9EFF]/30 flex items-center justify-center text-xs font-bold text-[#3B9EFF] shrink-0">
              {author.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-[#F5F7FA] truncate">
                {author.name}
              </span>
              {author.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3B9EFF] shrink-0" />
              )}
            </div>
            <p className="text-xs text-[#A8B0BD] truncate">
              Reviewed <span className="text-white/90 font-medium">{mediaTitle}</span>
            </p>
          </div>
        </div>

        {rating !== undefined && (
          <div className="px-2 py-1 rounded bg-[#F5C84B]/15 border border-[#F5C84B]/30 flex items-center gap-1 shrink-0">
            <Star className="w-3 h-3 fill-[#F5C84B] text-[#F5C84B]" />
            <span className="text-xs font-bold text-[#F5C84B]">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Review Body with Spoiler Guard */}
      {containsSpoilers && !revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="w-full p-4 rounded-lg bg-[#1A2330] border border-white/[0.06] flex items-center justify-center gap-2 text-xs font-bold text-[#F59E0B] hover:bg-[#1D2734] transition-colors cursor-pointer select-none"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>CONTAINS SPOILERS — TAP TO REVEAL</span>
        </button>
      ) : (
        <p
          className={`text-sm text-[#dee2ef] leading-relaxed ${
            isBengali ? "font-bengali text-[15px] leading-7" : "font-sans"
          }`}
        >
          {reviewText}
        </p>
      )}

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-1 text-xs text-[#6F7886] border-t border-white/[0.04]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              liked ? "text-[#F43F5E]" : "hover:text-[#F5F7FA]"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-[#F43F5E]" : ""}`} />
            <span>{likes}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentsCount}</span>
          </div>
        </div>
        <span>{timeAgo}</span>
      </div>
    </div>
  );
}
