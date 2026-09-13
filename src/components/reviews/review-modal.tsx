"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Star, AlertCircle, Loader2, Trash2, Film, AlertTriangle } from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { RATING_CONFIG, RatingCategory } from "@/lib/rating";
import { upsertMediaLog } from "@/actions/tracking";
import { useScrollLock } from "@/hooks/use-scroll-lock";

interface ReviewModalProps {
  media: NormalizedMedia;
  initialLog?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewModal({
  media,
  initialLog,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEditing = Boolean(initialLog?.reviewText && initialLog.reviewText.trim().length > 0);

  const [rating, setRating] = useState<RatingCategory | null>(
    (initialLog?.rating as RatingCategory) || null
  );
  const [reviewText, setReviewText] = useState<string>(initialLog?.reviewText || "");
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(
    Boolean(initialLog?.containsSpoilers)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useScrollLock(isOpen);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setError("Please write a review before saving.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await upsertMediaLog({
      media,
      status: initialLog?.status || "completed",
      rating,
      reviewText: reviewText.trim(),
      containsSpoilers,
      episodesWatched: initialLog?.episodesWatched || 0,
      currentSeason: initialLog?.currentSeason || 1,
      currentEpisode: initialLog?.currentEpisode || 1,
      isFavorite: initialLog?.isFavorite || false,
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else {
      onClose();
      onSuccess?.();
    }
  };

  const handleDeleteReview = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    const res = await upsertMediaLog({
      media,
      status: initialLog?.status || "completed",
      rating,
      reviewText: null, // Clear review text
      containsSpoilers: false,
      episodesWatched: initialLog?.episodesWatched || 0,
      currentSeason: initialLog?.currentSeason || 1,
      currentEpisode: initialLog?.currentEpisode || 1,
      isFavorite: initialLog?.isFavorite || false,
    });

    setIsDeleting(false);
    if (res.error) {
      setDeleteError(res.error);
    } else {
      setIsDeleteConfirmOpen(false);
      onClose();
      onSuccess?.();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overscroll-contain"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#151C27] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#121824]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#3B9EFF]/15 text-[#3B9EFF] flex items-center justify-center shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F7FA]">
                {isEditing ? "Edit Review" : "Write a Review"}
              </h2>
              <p className="text-[11px] text-[#6F7886] truncate max-w-[280px]">
                {media.title} {media.year ? `(${media.year})` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#A8B0BD] hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto p-5 gap-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Rating selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#6F7886] uppercase tracking-wider">
                Rating (Optional)
              </label>
              {rating && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="text-[11px] text-[#6F7886] hover:text-[#A8B0BD] transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              {(Object.keys(RATING_CONFIG) as RatingCategory[]).map((key) => {
                const cfg = RATING_CONFIG[key];
                const isSelected = rating === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRating(isSelected ? null : key)}
                    className={`py-2 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none last:col-span-2 ${
                      isSelected
                        ? `${cfg.activeBg} ${cfg.activeBorder} ${cfg.activeText} shadow-sm`
                        : "bg-[#1A2330] hover:bg-[#202C3D] border-white/[0.06] hover:border-white/[0.14] text-[#A8B0BD]"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#6F7886] uppercase tracking-wider">
              Your Review
            </label>
            <textarea
              rows={5}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you think of the story, acting, direction, or pacing? Share your perspective..."
              className="w-full px-3.5 py-3 rounded-xl bg-[#0F141D] border border-white/[0.08] focus:border-[#3B9EFF]/60 text-sm text-[#F5F7FA] placeholder-[#4B5563] outline-none transition resize-none"
            />
          </div>

          {/* Premium Spoiler Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={containsSpoilers}
            onClick={() => setContainsSpoilers(!containsSpoilers)}
            className={`w-full p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer select-none text-left group ${
              containsSpoilers
                ? "bg-amber-500/[0.08] border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                : "bg-[#0F141D]/80 hover:bg-[#0F141D] border-white/[0.06] hover:border-white/[0.12]"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  containsSpoilers
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm"
                    : "bg-white/[0.04] text-[#6F7886] group-hover:text-[#A8B0BD]"
                }`}
              >
                <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span
                  className={`text-xs font-semibold block transition-colors ${
                    containsSpoilers ? "text-amber-300" : "text-[#F5F7FA]"
                  }`}
                >
                  Review contains spoilers
                </span>
                <span className="text-[11px] text-[#6F7886] block truncate">
                  {containsSpoilers
                    ? "Spoiler warning will blur text until clicked"
                    : "Warn community readers about major plot details"}
                </span>
              </div>
            </div>

            {/* Polished iOS-style Toggle Switch */}
            <div
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                containsSpoilers
                  ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                : "bg-white/15"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  containsSpoilers ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.06] mt-1">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setIsDeleteConfirmOpen(true);
                }}
                disabled={isSubmitting || isDeleting}
                className="text-xs font-semibold text-[#F43F5E] hover:text-[#FB7185] transition cursor-pointer disabled:opacity-50"
              >
                Delete Review
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="h-9 px-4 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-[#A8B0BD] hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="h-9 px-4 rounded-lg bg-[#3B9EFF] hover:bg-[#5AAFFF] text-xs font-bold text-white shadow-md shadow-[#3B9EFF]/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isEditing ? "Update Review" : "Publish Review"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* =========================================================================
          DELETE REVIEW CONFIRMATION POPUP (Glassmorphic, Matches Quick Add Modal)
         ========================================================================= */}
      {isDeleteConfirmOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-review-confirm-title"
          aria-describedby="delete-review-confirm-desc"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overscroll-contain"
          onClick={() => {
            if (!isDeleting) setIsDeleteConfirmOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#18202F] via-[#121722] to-[#0D121A] border border-rose-500/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_45px_rgba(244,63,94,0.12)] p-6 overflow-hidden animate-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-rose-500/15 blur-2xl pointer-events-none rounded-full" />

            {/* Illuminated Danger Badge */}
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-[0_0_24px_rgba(244,63,94,0.25)] ring-1 ring-rose-400/20">
              <Trash2 className="w-6 h-6 stroke-[2.2]" />
            </div>

            {/* Heading */}
            <h3
              id="delete-review-confirm-title"
              className="text-lg font-bold text-[#F5F7FA] tracking-tight mb-1"
            >
              Delete Review?
            </h3>

            {/* Media Preview Chip */}
            <div className="my-3.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3 text-left">
              {media.posterPath ? (
                <img
                  src={media.posterPath}
                  alt={media.title}
                  className="w-10 h-14 object-cover rounded-lg shrink-0 shadow-sm border border-white/10"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`w-10 h-14 rounded-lg bg-[#151C27] shrink-0 ${
                  media.posterPath ? "hidden" : "flex"
                } items-center justify-center text-[#6F7886]`}
              >
                <Film className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-xs text-[#F5F7FA] truncate">
                  {media.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#A8B0BD]">
                  {media.year && <span>{media.year}</span>}
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="capitalize">{media.mediaType}</span>
                </div>
              </div>
            </div>

            {/* Explanatory Warning */}
            <p
              id="delete-review-confirm-desc"
              className="text-xs text-[#A8B0BD] leading-relaxed mb-5"
            >
              This will permanently delete your written review and critique for this title.
            </p>

            {/* Error Message if Deletion Failed */}
            {deleteError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400 text-center animate-in fade-in">
                {deleteError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 h-10 rounded-xl text-xs font-semibold text-[#A8B0BD] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteReview}
                className="flex-1 h-10 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] border border-rose-400/40 shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
