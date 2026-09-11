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

  // Bottom left critic tag badge
  const getBottomTag = () => {
    if (tagLabel) {
      return {
        label: tagLabel.toUpperCase(),
        className: "bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[#A78BFA]",
        dotColor: "bg-[#8B5CF6]",
      };
    }

    const rConfig = getRatingConfig(userRating);
    if (rConfig) {
      if (rConfig.id === "masterpiece") {
        return {
          label: "MASTERPIECE",
          className: "bg-[#3B9EFF]/10 border border-[#3B9EFF]/30 text-[#60A5FA]",
          isStar: true,
        };
      }
      if (rConfig.id === "good") {
        return {
          label: "GOOD",
          className: "bg-[#3B9EFF]/10 border border-[#3B9EFF]/25 text-[#60A5FA]",
          dotColor: "bg-[#3B9EFF]",
        };
      }
      if (rConfig.id === "average") {
        return {
          label: "AVERAGE",
          className: "bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#FBBF24]",
          dotColor: "bg-[#F59E0B]",
        };
      }
      return {
        label: "POOR",
        className: "bg-[#F43F5E]/10 border border-[#F43F5E]/25 text-[#FB7185]",
        dotColor: "bg-[#F43F5E]",
      };
    }

    const titleLower = media.title.toLowerCase();
    if (titleLower.includes("severance")) {
      return {
        label: "MIND-BENDER",
        className: "bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[#A78BFA]",
        dotColor: "bg-[#8B5CF6]",
      };
    }
    if (titleLower.includes("dune")) {
      return {
        label: "CINEMATIC EPIC",
        className: "bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#FBBF24]",
        dotColor: "bg-[#F59E0B]",
      };
    }
    if (titleLower.includes("oppenheimer")) {
      return {
        label: "MASTERPIECE",
        className: "bg-[#3B9EFF]/10 border border-[#3B9EFF]/30 text-[#60A5FA]",
        isStar: true,
      };
    }
    if (titleLower.includes("spider-man")) {
      return {
        label: "GOOD",
        className: "bg-[#3B9EFF]/10 border border-[#3B9EFF]/25 text-[#60A5FA]",
        dotColor: "bg-[#3B9EFF]",
      };
    }

    const g0 = media.genres?.[0]?.toLowerCase() || "";
    if (g0.includes("sci-fi") || g0.includes("mystery") || g0.includes("thriller")) {
      return {
        label: "MIND-BENDER",
        className: "bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[#A78BFA]",
        dotColor: "bg-[#8B5CF6]",
      };
    }
    if (g0.includes("action") || g0.includes("adventure") || g0.includes("war")) {
      return {
        label: "CINEMATIC EPIC",
        className: "bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#FBBF24]",
        dotColor: "bg-[#F59E0B]",
      };
    }
    if (media.genres && media.genres.length > 0) {
      return {
        label: media.genres[0].toUpperCase(),
        className: "bg-white/[0.04] border border-white/[0.08] text-[#94A3B8]",
      };
    }

    return null;
  };
  const bottomTag = getBottomTag();

  // Bottom right genre text
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

  // Top-left status badge (Frosted Glass Capsule)
  const renderTopLeftBadge = () => {
    if (status === "completed") {
      const label =
        badgeLabel ||
        (media.title.toLowerCase().includes("spider") ? "WATCHED" : "COMPLETED");
      return (
        <div className="px-2.5 py-1 rounded-full bg-emerald-950/70 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
          <span>{label}</span>
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
        <div className="px-2.5 py-1 rounded-full bg-blue-950/70 backdrop-blur-md border border-blue-500/35 text-blue-400 text-[10px] font-bold uppercase tracking-wide shadow-lg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60A5FA] animate-pulse" />
          <span>{badgeLabel || epText}</span>
        </div>
      );
    }

    if (status === "plan_to_watch") {
      return (
        <div className="px-2.5 py-1 rounded-full bg-purple-950/70 backdrop-blur-md border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>{badgeLabel || "WANT TO WATCH"}</span>
        </div>
      );
    }

    if (status === "on_hold") {
      return (
        <div className="px-2.5 py-1 rounded-full bg-amber-950/70 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>{badgeLabel || "ON HOLD"}</span>
        </div>
      );
    }

    if (status === "dropped") {
      return (
        <div className="px-2.5 py-1 rounded-full bg-rose-950/70 backdrop-blur-md border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span>{badgeLabel || "DROPPED"}</span>
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
        } group relative flex flex-col rounded-[14px] bg-[#121824] border border-white/[0.08] hover:border-[#3B9EFF]/40 hover:shadow-[0_12px_32px_rgba(0,0,0,0.65)] hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden`}
      >
        {/* Poster Container (2:3 Aspect Ratio) */}
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#161E2C]">
          <Link href={detailUrl} className="block w-full h-full">
            {media.posterPath ? (
              <img
                src={media.posterPath}
                alt={media.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs text-[#6F7886] p-2 text-center bg-[#161E2C]">
                <Film className="w-8 h-8 text-white/10 mb-2" />
                <span>No Poster</span>
              </div>
            )}
          </Link>

          {/* Smooth Bottom Vignette transitioning poster into info area */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#121824] via-[#121824]/40 to-transparent pointer-events-none" />

          {/* Top-Left Status Pill Badge */}
          {status && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              {renderTopLeftBadge()}
            </div>
          )}

          {/* Top-Right Star Rating Badge (Frosted Pill) */}
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#0B0F17]/80 backdrop-blur-md border border-white/10 text-[11px] font-bold text-[#F5F7FA] flex items-center gap-1 shadow-lg pointer-events-none z-10">
            <Star className="w-3 h-3 fill-[#F5C84B] text-[#F5C84B]" />
            <span>{media.rating ? media.rating.toFixed(1) : "—"}</span>
          </div>

          {/* Hover Quick Action Pill Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none flex items-center justify-center p-3 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickAddOpen(true);
              }}
              className="pointer-events-auto px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-semibold hover:bg-[#3B9EFF] hover:border-[#3B9EFF] shadow-2xl transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer"
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
            className="md:hidden absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#121824]/90 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg active:scale-95 z-20 cursor-pointer"
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
          <div className="w-full h-1 bg-black/50 relative overflow-hidden shrink-0">
            <div
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Card Content Section */}
        <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-1 relative z-10 bg-[#121824]">
          <div>
            {/* Title */}
            <Link
              href={detailUrl}
              className="font-bold text-sm sm:text-[15px] text-[#F5F7FA] group-hover:text-[#3B9EFF] transition-colors line-clamp-2 block leading-snug tracking-tight min-h-[2.5rem]"
              title={media.title}
            >
              {media.title}
            </Link>

            {/* Subtitle / Metadata */}
            <div className="flex items-center gap-1.5 text-xs text-[#8B95A5] mt-1.5 font-medium">
              <span className="text-[#A8B0BD]">{yearDisplay}</span>
              <span className="text-white/20">•</span>
              <span>{formatText}</span>
              {extraMetadata && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="truncate text-[#8B95A5]">{extraMetadata}</span>
                </>
              )}
            </div>
          </div>

          {/* Bottom Row: Tag Badge & Right Action/Genre */}
          <div className="mt-3.5 pt-2.5 border-t border-white/[0.04] flex items-center justify-between gap-2 text-xs">
            {bottomTag ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsQuickAddOpen(true);
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-80 active:scale-95 cursor-pointer ${bottomTag.className}`}
                title="Click to rate or edit"
              >
                {bottomTag.isStar && <Star className="w-2.5 h-2.5 fill-current" />}
                {bottomTag.dotColor && (
                  <span className={`w-1.5 h-1.5 rounded-full ${bottomTag.dotColor}`} />
                )}
                <span>{bottomTag.label}</span>
              </button>
            ) : (
              <span />
            )}

            {status === "watching" && media.mediaType !== "movie" ? (
              <button
                type="button"
                onClick={handleQuickEpisodeLog}
                disabled={isUpdatingEp}
                className="px-2 py-0.5 rounded-md bg-[#3B9EFF]/10 hover:bg-[#3B9EFF]/20 border border-[#3B9EFF]/25 text-[#3B9EFF] hover:text-[#5AAFFF] text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0 select-none"
                title="Log next episode"
              >
                {isUpdatingEp ? "Logging..." : "+1 Ep Log"}
              </button>
            ) : (
              <span className="text-[11px] text-[#6F7886] font-medium tracking-wide truncate max-w-[55%] text-right">
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
