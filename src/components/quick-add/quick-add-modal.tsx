"use client";

import { useState, useEffect } from "react";
import { X, Star, Plus, Minus, Check, Film, Loader2 } from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { upsertMediaLog } from "@/actions/tracking";

interface QuickAddModalProps {
  media: NormalizedMedia | null;
  isOpen: boolean;
  onClose: () => void;
  initialLog?: {
    status?: string;
    rating?: number | null;
    episodesWatched?: number;
    reviewText?: string | null;
    containsSpoilers?: boolean;
    isFavorite?: boolean;
  } | null;
  onSuccess?: () => void;
}

export function QuickAddModal({
  media,
  isOpen,
  onClose,
  initialLog,
  onSuccess,
}: QuickAddModalProps) {
  const [status, setStatus] = useState<
    "watching" | "completed" | "plan_to_watch" | "on_hold" | "dropped"
  >("watching");
  const [rating, setRating] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (media) {
      setStatus(
        (initialLog?.status as any) ||
          (media.mediaType === "movie" ? "completed" : "watching")
      );
      setRating(initialLog?.rating !== undefined ? initialLog.rating : null);
      setEpisodes(initialLog?.episodesWatched || 0);
      setReview(initialLog?.reviewText || "");
      setContainsSpoilers(initialLog?.containsSpoilers || false);
    }
  }, [media, initialLog]);

  if (!isOpen || !media) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const res = await upsertMediaLog({
        media,
        status,
        rating,
        episodesWatched: episodes,
        reviewText: review,
        containsSpoilers,
      });

      if (res?.error) {
        setToastMessage(res.error);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      setToastMessage(err.message || "Failed to save.");
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "watching", label: "Watching", color: "bg-[#3B9EFF]/20 border-[#3B9EFF] text-[#3B9EFF]" },
    { value: "completed", label: "Completed", color: "bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E]" },
    { value: "plan_to_watch", label: "Plan to See", color: "bg-white/10 border-white/30 text-white" },
    { value: "on_hold", label: "On Hold", color: "bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]" },
    { value: "dropped", label: "Dropped", color: "bg-[#F43F5E]/20 border-[#F43F5E] text-[#F43F5E]" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#151C27] border border-white/[0.08] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Preview */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-start justify-between gap-3 bg-[#1A2330]/40">
          <div className="flex gap-3 min-w-0">
            {media.posterPath ? (
              <img
                src={media.posterPath}
                alt={media.title}
                className="w-14 h-20 rounded-lg object-cover bg-[#1D2734] shrink-0 shadow-md"
              />
            ) : (
              <div className="w-14 h-20 rounded-lg bg-[#1D2734] shrink-0 flex items-center justify-center text-[#6F7886]">
                <Film className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0 flex flex-col justify-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3B9EFF]">
                CineTrack Quick-Log • {media.year || "Release"}
              </span>
              <h3 className="font-bold text-base text-[#F5F7FA] truncate mt-0.5">
                {media.title}
              </h3>
              <p className="text-xs text-[#A8B0BD] truncate mt-0.5">
                <span className="capitalize">{media.mediaType}</span>
                {media.runtime ? ` • ${media.runtime} min` : ""}
                {media.totalEpisodes > 1 ? ` • ${media.totalEpisodes} eps` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8B0BD] hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8B0BD] mb-2">
              Watch Status
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {statusOptions.map((opt) => {
                const isActive = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value as any)}
                    className={`h-9 px-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? opt.color
                        : "bg-[#1D2734] border-white/[0.06] text-[#A8B0BD] hover:text-white hover:bg-[#1A2330]"
                    }`}
                  >
                    {isActive && <Check className="w-3.5 h-3.5" />}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Scale (10 Stars) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A8B0BD]">
                Your Rating
              </label>
              <span className="text-xs font-bold text-[#F5C84B]">
                {rating !== null ? `★ ${rating.toFixed(1)} / 10` : "Not Rated"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 bg-[#1D2734] p-2.5 rounded-lg border border-white/[0.06]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starValue) => {
                const isSelected = rating !== null && rating >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(rating === starValue ? null : starValue)}
                    className="p-1 text-[#4B5563] hover:text-[#F5C84B] transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        isSelected ? "fill-[#F5C84B] text-[#F5C84B]" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Episode Progress (for TV and Anime) */}
          {media.mediaType !== "movie" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8B0BD] mb-2">
                Episode Progress
              </label>
              <div className="flex items-center justify-between bg-[#1D2734] p-2.5 rounded-lg border border-white/[0.06]">
                <span className="text-sm text-[#F5F7FA] font-medium">
                  {episodes} / {media.totalEpisodes || "∞"} watched
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEpisodes(Math.max(0, episodes - 1))}
                    disabled={episodes <= 0}
                    className="w-8 h-8 rounded bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-30 flex items-center justify-center text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEpisodes(
                        media.totalEpisodes
                          ? Math.min(media.totalEpisodes, episodes + 1)
                          : episodes + 1
                      )
                    }
                    className="w-8 h-8 rounded bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Review Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8B0BD] mb-2">
              Review or Thoughts
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review in English or বাংলা (Bengali)..."
              rows={3}
              className="w-full p-3 rounded-lg bg-[#1D2734] border border-white/[0.08] text-sm text-[#F5F7FA] placeholder-[#6F7886] focus:outline-none focus:border-[#3B9EFF] transition-colors resize-none font-sans"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="w-4 h-4 rounded bg-[#1D2734] border-white/20 text-[#3B9EFF] focus:ring-0"
              />
              <span className="text-xs text-[#A8B0BD]">
                Review contains major spoilers
              </span>
            </label>
          </div>

          {toastMessage && (
            <div className="p-3 rounded-lg bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-xs text-[#F43F5E]">
              {toastMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/[0.06] flex items-center justify-end gap-2 bg-[#1A2330]/40">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm font-medium text-[#A8B0BD] hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="h-10 px-6 rounded-lg text-sm font-semibold bg-[#3B9EFF] text-white hover:bg-[#5AAFFF] active:scale-95 transition-all flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save to Library</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
