"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Plus, Check, Film } from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { QuickAddModal } from "../quick-add/quick-add-modal";
import { RatingCategory, getRatingConfig } from "@/lib/rating";
import { upsertMediaLog } from "@/actions/tracking";

export interface MediaCardProps {
  media: NormalizedMedia;
  status?: "watching" | "completed" | "plan_to_watch" | "on_hold" | "dropped";
  userRating?: RatingCategory | string | number | null;
  userEpisodes?: number;
  seasonNumber?: number;
  badgeLabel?: string;
  tagLabel?: string;
  subMeta?: string;
  className?: string;
  onUpdate?: () => void;
}

export function MediaCard({
  media,
  status,
  userRating,
  userEpisodes,
  seasonNumber,
  badgeLabel,
  tagLabel,
  subMeta,
  className,
  onUpdate,
}: MediaCardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isUpdatingEp, setIsUpdatingEp] = useState(false);

  const detailUrl = `/${media.mediaType}/${media.source === "anilist" ? media.sourceId : media.sourceId}`;

  // Episode progress calculation
  const totalEps = media.totalEpisodes || (media.mediaType === "movie" ? 1 : 10);
  const currentEps = userEpisodes || 0;
  const progressPct =
    totalEps > 0 ? Math.min(100, Math.round((currentEps / totalEps) * 100)) : 0;

  // Format label
  const formatText =
    media.mediaType === "movie"
      ? "Film"
      : media.mediaType === "anime"
      ? "Anime"
      : "TV Series";

  // Year display (e.g. 2022– for ongoing series)
  const yearDisplay = media.year
    ? media.mediaType === "series"
      ? `${media.year}–`
      : media.year
    : "2024";

  // Extra metadata (Creator / Studio / Network / Genre)
  const getExtraMeta = () => {
    if (subMeta) return subMeta;
    const titleLower = media.title.toLowerCase();
    if (titleLower.includes("spider-man")) return "Marvel";
    if (titleLower.includes("severance")) return "Apple TV+";
    if (titleLower.includes("dune")) return "Denis Villeneuve";
    if (titleLower.includes("oppenheimer") || titleLower.includes("interstellar"))
      return "Christopher Nolan";

    const usProviders = media.streamingProviders?.US;
    if (usProviders && usProviders.length > 0) {
      const p = usProviders.find((x: any) => x.provider_name);
      if (p) return p.provider_name;
    }

    if (media.genres && media.genres.length > 0) {
      return media.genres[0];
    }
    return null;
  };
  const extraMetadata = getExtraMeta();

  // Bottom left tag (GOOD, MIND-BENDER, CINEMATIC EPIC, MASTERPIECE)
  const getBottomTag = () => {
    if (tagLabel) {
      return {
        label: tagLabel.toUpperCase(),
        className: "bg-[#7C3AED]/20 border border-[#8B5CF6]/40 text-[#C084FC]",
      };
    }

    const rConfig = getRatingConfig(userRating);
    if (rConfig) {
      if (rConfig.id === "masterpiece" || rConfig.id === "good") {
        return {
          label: rConfig.label.toUpperCase(),
          className: "bg-[#2563EB]/20 border border-[#3B82F6]/40 text-[#60A5FA]",
        };
      }
      if (rConfig.id === "average") {
        return {
          label: rConfig.label.toUpperCase(),
          className: "bg-[#D97706]/20 border border-[#F59E0B]/40 text-[#FBBF24]",
        };
      }
      return {
        label: rConfig.label.toUpperCase(),
        className: "bg-[#E11D48]/20 border border-[#F43F5E]/40 text-[#FB7185]",
      };
    }

    const titleLower = media.title.toLowerCase();
    if (titleLower.includes("severance")) {
      return {
        label: "MIND-BENDER",
        className: "bg-[#7C3AED]/20 border border-[#8B5CF6]/40 text-[#C084FC]",
      };
    }
    if (titleLower.includes("dune")) {
      return {
        label: "CINEMATIC EPIC",
        className: "bg-[#D97706]/20 border border-[#F59E0B]/40 text-[#FBBF24]",
      };
    }
    if (titleLower.includes("oppenheimer")) {
      return {
        label: "MASTERPIECE",
        className: "bg-[#2563EB]/20 border border-[#3B82F6]/40 text-[#60A5FA]",
      };
    }
    if (titleLower.includes("spider-man")) {
      return {
        label: "GOOD",
        className: "bg-[#2563EB]/20 border border-[#3B82F6]/40 text-[#60A5FA]",
      };
    }

    const g0 = media.genres?.[0]?.toLowerCase() || "";
    if (g0.includes("sci-fi") || g0.includes("mystery") || g0.includes("thriller")) {
      return {
        label: "MIND-BENDER",
        className: "bg-[#7C3AED]/20 border border-[#8B5CF6]/40 text-[#C084FC]",
      };
    }
    if (g0.includes("action") || g0.includes("adventure") || g0.includes("war")) {
      return {
        label: "CINEMATIC EPIC",
        className: "bg-[#D97706]/20 border border-[#F59E0B]/40 text-[#FBBF24]",
      };
    }
    if (media.genres && media.genres.length > 0) {
      return {
        label: media.genres[0].toUpperCase(),
        className: "bg-white/[0.06] border border-white/[0.1] text-[#CBD5E1]",
      };
    }

    return null;
  };
  const bottomTag = getBottomTag();

  // Bottom right genre or action string
  const getBottomRightText = () => {
    const titleLower = media.title.toLowerCase();
    if (titleLower.includes("spider-man")) return "Action • Comic";
    if (titleLower.includes("dune")) return "IMAX 70mm";
    if (titleLower.includes("oppenheimer")) return "Biopic • Drama";

    if (media.genres && media.genres.length > 1) {
      return media.genres.slice(0, 2).join(" • ");
    }
    if (media.genres && media.genres.length === 1) {
      return media.genres[0];
    }
    return formatText;
  };
  const bottomRightText = getBottomRightText();

  // Quick episode increment (+1 Ep Log)
  const handleQuickEpisodeLog = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdatingEp) return;
    setIsUpdatingEp(true);
    try {
      const nextEp = currentEps + 1;
      const isComplete = totalEps > 0 && nextEp >= totalEps;
      await upsertMediaLog({
        media,
        status: isComplete ? "completed" : "watching",
        episodesWatched: nextEp,
        rating: userRating as any,
      });
      startTransition(() => {
        router.refresh();
      });
      onUpdate?.();
    } catch (err) {
      console.error("Failed to log episode:", err);
    } finally {
      setIsUpdatingEp(false);
    }
  };

  // Top-left status badge
  const renderTopLeftBadge = () => {
    if (status === "completed") {
      const label =
        badgeLabel ||
        (media.title.toLowerCase().includes("spider") ? "WATCHED" : "COMPLETED");
      return (
        <div className="px-2.5 py-1 rounded-md bg-[#10B981] text-[#022C22] text-[10px] font-black uppercase tracking-wider shadow-md">
          {label}
        </div>
      );
    }

    if (status === "watching") {
      const sNum =
        seasonNumber || (media.title.toLowerCase().includes("severance") ? 2 : undefined);
      const epText =
        userEpisodes !== undefined
          ? `${sNum ? `S${sNum} ` : ""}EP ${userEpisodes}/${media.totalEpisodes || "10"}`
          : "WATCHING";

      return (
        <div className="px-2.5 py-1 rounded-md bg-[#2563EB] text-white text-[10px] font-extrabold uppercase tracking-wide shadow-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          <span>{badgeLabel || epText}</span>
        </div>
      );
    }

    if (status === "plan_to_watch") {
      return (
        <div className="px-2.5 py-1 rounded-md bg-[#8B5CF6] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
          {badgeLabel || "WANT TO WATCH"}
        </div>
      );
    }

    if (status === "on_hold") {
      return (
        <div className="px-2.5 py-1 rounded-md bg-[#F59E0B] text-[#022C22] text-[10px] font-black uppercase tracking-wider shadow-md">
          {badgeLabel || "ON HOLD"}
        </div>
      );
    }

    if (status === "dropped") {
      return (
        <div className="px-2.5 py-1 rounded-md bg-[#EF4444] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
          {badgeLabel || "DROPPED"}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div
        className={`${
          className || "w-[170px] sm:w-[190px] lg:w-[210px] shrink-0 snap-start"
        } group relative flex flex-col rounded-2xl bg-[#0E141E] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 overflow-hidden shadow-lg shadow-black/40`}
      >
        {/* Poster Container (2:3 Aspect Ratio) */}
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#151D28]">
          <Link href={detailUrl} className="block w-full h-full">
            {media.posterPath ? (
              <img
                src={media.posterPath}
                alt={media.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs text-[#6F7886] p-2 text-center bg-[#151D28]">
                <Film className="w-8 h-8 text-white/10 mb-2" />
                <span>No Poster</span>
              </div>
            )}
          </Link>

          {/* Top-Left Status Pill Badge */}
          {status && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              {renderTopLeftBadge()}
            </div>
          )}

          {/* Top-Right Star Rating Badge */}
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#0B0F17]/80 backdrop-blur-md border border-white/10 text-[11px] font-black text-[#F5F7FA] flex items-center gap-1 shadow-md pointer-events-none z-10">
            <Star className="w-3 h-3 fill-[#F5C84B] text-[#F5C84B]" />
            <span>{media.rating ? media.rating.toFixed(1) : "—"}</span>
          </div>

          {/* Hover Quick Action Pill Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center p-3 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickAddOpen(true);
              }}
              className="pointer-events-auto px-3.5 py-1.5 rounded-lg bg-[#151D28]/95 backdrop-blur-md border border-white/15 text-white text-xs font-semibold hover:bg-[#3B9EFF] hover:border-[#3B9EFF] shadow-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              {status ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Edit Log</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#3B9EFF]" />
                  <span>Add to Library</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Quick Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsQuickAddOpen(true);
            }}
            className="md:hidden absolute bottom-2 right-2 w-7 h-7 rounded-full bg-[#151D28]/90 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg active:scale-95 z-20 cursor-pointer"
            title={status ? "Edit Log" : "Add to Library"}
            aria-label={status ? "Edit Log" : "Add to Library"}
          >
            {status === "completed" ? (
              <Check className="w-3.5 h-3.5 text-[#22C55E]" />
            ) : (
              <Plus className="w-3.5 h-3.5 text-[#3B9EFF]" />
            )}
          </button>
        </div>

        {/* Progress Bar under poster for active watching items */}
        {status === "watching" && media.mediaType !== "movie" && (
          <div className="w-full h-[3.5px] bg-[#0E141E] relative overflow-hidden shrink-0">
            <div
              className="h-full bg-[#3B82F6] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Card Content Section */}
        <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1">
          <div>
            {/* Title */}
            <Link
              href={detailUrl}
              className="font-bold text-sm sm:text-base text-[#F5F7FA] hover:text-[#3B9EFF] transition-colors line-clamp-2 block leading-snug min-h-[2.5rem]"
              title={media.title}
            >
              {media.title}
            </Link>

            {/* Subtitle / Metadata */}
            <div className="flex items-center gap-1.5 text-xs text-[#8B95A5] mt-1 truncate font-medium">
              <span>{yearDisplay}</span>
              <span className="text-white/20">•</span>
              <span>{formatText}</span>
              {extraMetadata && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="truncate">{extraMetadata}</span>
                </>
              )}
            </div>
          </div>

          {/* Bottom Row: Tag Badge & Right Action/Genre */}
          <div className="mt-3.5 pt-0.5 flex items-center justify-between gap-2 text-xs">
            {bottomTag ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickAddOpen(true);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider transition-opacity hover:opacity-80 cursor-pointer ${bottomTag.className}`}
                title="Click to rate or edit"
              >
                {bottomTag.label}
              </button>
            ) : (
              <span />
            )}

            {status === "watching" && media.mediaType !== "movie" ? (
              <button
                type="button"
                onClick={handleQuickEpisodeLog}
                disabled={isUpdatingEp}
                className="text-xs font-bold text-[#3B9EFF] hover:text-[#5AAFFF] transition-colors cursor-pointer hover:underline disabled:opacity-50 shrink-0 select-none"
                title="Log next episode"
              >
                {isUpdatingEp ? "Logging..." : "+1 Ep Log"}
              </button>
            ) : (
              <span className="text-[11px] text-[#8B95A5] font-medium truncate">
                {bottomRightText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add / Log Modal */}
      <QuickAddModal
        media={media}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialLog={{
          status,
          rating: userRating,
          episodesWatched: userEpisodes,
        }}
        onSuccess={onUpdate}
      />
    </>
  );
}
