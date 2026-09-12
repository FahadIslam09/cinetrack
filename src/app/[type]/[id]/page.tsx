import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Plus, Film, Tv, Check, Bookmark, ChevronRight, ExternalLink } from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { ReviewCard } from "@/components/reviews/review-card";
import { MediaCard } from "@/components/media/media-card";
import { tmdb } from "@/lib/tmdb/client";
import { anilist } from "@/lib/anilist/client";
import {
  normalizeTmdbMovie,
  normalizeTmdbTV,
  normalizeAniListAnime,
  NormalizedMedia,
} from "@/lib/media/normalize";
import { createClient } from "@/lib/supabase/server";
import { getUserMediaLog } from "@/actions/tracking";
import { MediaDetailsActions } from "./actions-client";
import { DetailsBackButton } from "./back-button";
import { TrailerPlayer, TrailerVideo } from "@/components/media/trailer-player";
import { db } from "@/lib/db";
import { profiles, userMediaLogs } from "@/lib/db/schema";
import { eq, and, isNotNull, desc } from "drizzle-orm";

interface PageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
  searchParams?: Promise<{
    from?: string;
    ref?: string;
  }>;
}

export default async function MediaDetailsPage({ params, searchParams }: PageProps) {
  const { type, id } = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const fromUsername = resolvedSearchParams.from || resolvedSearchParams.ref;
  const fallbackUrl = fromUsername
    ? fromUsername === "library"
      ? "/library"
      : `/u/${fromUsername}`
    : "/";

  let media: NormalizedMedia | null = null;
  let rawDetails: any = null;

  try {
    if (type === "movie") {
      rawDetails = await tmdb.getMovieDetails(id);
      media = normalizeTmdbMovie(rawDetails);
    } else if (type === "series" || type === "tv") {
      rawDetails = await tmdb.getTVDetails(id);
      media = normalizeTmdbTV(rawDetails);
    } else if (type === "anime") {
      rawDetails = await anilist.getAnimeDetails(id);
      media = normalizeAniListAnime(rawDetails);
    }
  } catch (err) {
    console.error("Error fetching media details:", err);
    notFound();
  }

  if (!media) notFound();

  // Extract IMDb ID for unrestricted trailer / video gallery fallback
  const imdbId: string | null =
    rawDetails?.imdb_id || rawDetails?.external_ids?.imdb_id || null;

  // Extract YouTube trailers & clips
  let trailerVideos: TrailerVideo[] = [];
  if (type === "movie" || type === "series" || type === "tv") {
    const rawVideos: any[] = rawDetails?.videos?.results || [];
    const ytVideos = rawVideos.filter(
      (v) => v.site === "YouTube" && Boolean(v.key)
    );

    // Prioritize actual Trailers first, then Teasers, then other clips
    ytVideos.sort((a, b) => {
      const getScore = (v: any) => {
        const isTrailer = v.type === "Trailer" || v.name?.toLowerCase().includes("trailer");
        const isTeaser = v.type === "Teaser" || v.name?.toLowerCase().includes("teaser");
        if (isTrailer && v.official) return 1;
        if (isTrailer) return 2;
        if (isTeaser && v.official) return 3;
        if (isTeaser) return 4;
        return 10;
      };
      return getScore(a) - getScore(b);
    });

    trailerVideos = ytVideos.map((v) => ({
      key: v.key,
      name: v.name,
      type: v.type,
    }));
  } else if (type === "anime") {
    if (rawDetails?.trailer?.site === "youtube" && rawDetails?.trailer?.id) {
      trailerVideos = [
        {
          key: rawDetails.trailer.id,
          name: "Official Trailer",
          type: "Trailer",
        },
      ];
    }
  }

  const trailerKey = trailerVideos[0]?.key || null;

  // Fetch user tracking log for this title if authenticated
  const userLog = await getUserMediaLog(media.id);

  // Fetch contextual curator review if user arrived from a specific profile (?from=username)
  let contextualReview: {
    author: {
      username: string;
      fullName: string;
      avatarUrl?: string;
      isVerified?: boolean;
    };
    rating?: string | null;
    reviewText: string;
    containsSpoilers: boolean;
    updatedAt?: Date | null;
  } | null = null;

  if (fromUsername) {
    const cleanUsername = fromUsername.replace(/^@/, "").toLowerCase().trim();
    try {
      let refProfile: any = null;
      let refLog: any = null;

      if (cleanUsername === "library" || cleanUsername === "me") {
        const supabase = await createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const [myProfile] = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, authUser.id))
            .limit(1);

          refProfile = myProfile;
          refLog = userLog;
        }
      } else {
        const [foundProfile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.username, cleanUsername))
          .limit(1);

        refProfile = foundProfile;

        if (refProfile) {
          const [foundLog] = await db
            .select()
            .from(userMediaLogs)
            .where(
              and(
                eq(userMediaLogs.userId, refProfile.id),
                eq(userMediaLogs.mediaId, media.id)
              )
            )
            .limit(1);

          refLog = foundLog;
        }
      }

      if (refProfile && refLog && refLog.reviewText && refLog.reviewText.trim().length > 0) {
        contextualReview = {
          author: {
            username: refProfile.username,
            fullName: refProfile.fullName || refProfile.username,
            avatarUrl: refProfile.avatarUrl || undefined,
            isVerified: true,
          },
          rating: refLog.rating,
          reviewText: refLog.reviewText.trim(),
          containsSpoilers: Boolean(refLog.containsSpoilers),
          updatedAt: refLog.updatedAt,
        };
      } else if (cleanUsername === "elenavance") {
        // Fallback demo curator review if testing demo profile Elena Vance
        if (
          media.title.toLowerCase().includes("dune") ||
          id === "693134"
        ) {
          contextualReview = {
            author: {
              username: "elenavance",
              fullName: "Elena Vance",
              avatarUrl:
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop",
              isVerified: true,
            },
            rating: "masterpiece",
            reviewText:
              "Villeneuve achieves an astonishing sensory convergence of religious fervor and sonic weaponization. Greig Fraser's infrared cinematography during the Giedi Prime gladiatorial sequence creates an almost alien physical presence rarely allowed in high-budget cinema.",
            containsSpoilers: false,
            updatedAt: new Date(),
          };
        } else if (
          media.title.toLowerCase().includes("severance") ||
          id === "97951"
        ) {
          contextualReview = {
            author: {
              username: "elenavance",
              fullName: "Elena Vance",
              avatarUrl:
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop",
              isVerified: true,
            },
            rating: "masterpiece",
            reviewText:
              "The season finale ties the severed floor dialectic directly to corporate religious worship. The execution of the elevator descent sequence is unmatched in contemporary prestige television.",
            containsSpoilers: true,
            updatedAt: new Date(),
          };
        }
      }
    } catch (err) {
      console.error("Contextual review query error:", err);
    }
  }

  // Fetch broader community reviews for lower Member Dispatches section
  let communityReviews: Array<{
    id: string;
    author: {
      name: string;
      avatarUrl?: string;
      isVerified?: boolean;
    };
    rating?: string | null;
    reviewText: string;
    containsSpoilers?: boolean;
    timeAgo: string;
  }> = [];

  try {
    const rawCommunityLogs = await db
      .select({
        log: userMediaLogs,
        profile: profiles,
      })
      .from(userMediaLogs)
      .innerJoin(profiles, eq(userMediaLogs.userId, profiles.id))
      .where(
        and(
          eq(userMediaLogs.mediaId, media.id),
          isNotNull(userMediaLogs.reviewText)
        )
      )
      .orderBy(desc(userMediaLogs.updatedAt))
      .limit(6);

    communityReviews = rawCommunityLogs
      .filter((r) => r.log.reviewText && r.log.reviewText.trim().length > 0)
      .map((r) => ({
        id: r.log.id,
        author: {
          name: r.profile.fullName || r.profile.username,
          avatarUrl: r.profile.avatarUrl || undefined,
          isVerified: true,
        },
        rating: r.log.rating,
        reviewText: r.log.reviewText!,
        containsSpoilers: Boolean(r.log.containsSpoilers),
        timeAgo: r.log.updatedAt
          ? new Intl.DateTimeFormat("en", {
              month: "short",
              day: "numeric",
            }).format(new Date(r.log.updatedAt))
          : "Recent log",
      }));
  } catch (err) {
    console.error("Community reviews fetch error:", err);
  }

  // Streaming Providers resolution
  const rawProviderResults = (media.streamingProviders as any) || {};

  // Find country with best availability: prefer US, then GB, CA, AU, or first available country with data
  const preferredCountries = ["US", "GB", "CA", "AU", "IN", "BD"];
  const availableCountry =
    preferredCountries.find((c) => {
      const data = rawProviderResults[c];
      return (
        data &&
        (data.flatrate?.length || data.ads?.length || data.rent?.length || data.buy?.length)
      );
    }) ||
    Object.keys(rawProviderResults).find((c) => {
      const data = rawProviderResults[c];
      return (
        data &&
        (data.flatrate?.length || data.ads?.length || data.rent?.length || data.buy?.length)
      );
    });

  const countryData = availableCountry ? rawProviderResults[availableCountry] : null;

  interface ResolvedProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
    typeBadge: "Stream" | "Free" | "Rent/Buy";
  }

  const providers: ResolvedProvider[] = [];
  const seenProviderIds = new Set<number>();

  if (countryData) {
    // 1. Subscription / Flatrate streaming (e.g. Netflix, Prime Video, MGM+, Max)
    (countryData.flatrate || []).forEach((p: any) => {
      if (!seenProviderIds.has(p.provider_id)) {
        seenProviderIds.add(p.provider_id);
        providers.push({
          provider_id: p.provider_id,
          provider_name: p.provider_name,
          logo_path: p.logo_path,
          typeBadge: "Stream",
        });
      }
    });

    // 2. Free with Ads (e.g. Tubi, YouTube Free)
    (countryData.ads || []).forEach((p: any) => {
      if (!seenProviderIds.has(p.provider_id)) {
        seenProviderIds.add(p.provider_id);
        providers.push({
          provider_id: p.provider_id,
          provider_name: p.provider_name,
          logo_path: p.logo_path,
          typeBadge: "Free",
        });
      }
    });

    // 3. Rent / Buy (VOD stores: Apple TV, Amazon Video, Google Play)
    [...(countryData.rent || []), ...(countryData.buy || [])].forEach((p: any) => {
      if (!seenProviderIds.has(p.provider_id)) {
        seenProviderIds.add(p.provider_id);
        providers.push({
          provider_id: p.provider_id,
          provider_name: p.provider_name,
          logo_path: p.logo_path,
          typeBadge: "Rent/Buy",
        });
      }
    });
  }

  const watchUrl = countryData?.link || null;

  // Cast members
  const castList =
    type === "anime"
      ? (rawDetails?.characters?.edges || []).slice(0, 6).map((c: any) => ({
          name: c.node.name.full,
          role: c.role,
          image: c.node.image.medium,
        }))
      : (rawDetails?.credits?.cast || []).slice(0, 6).map((c: any) => ({
          name: c.name,
          role: c.character,
          image: c.profile_path
            ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
            : null,
        }));

  // Similar / recommendations
  const similarItems: NormalizedMedia[] =
    type === "anime"
      ? (rawDetails?.recommendations?.nodes || [])
          .slice(0, 4)
          .map((r: any) => normalizeAniListAnime(r.mediaRecommendation))
          .filter(Boolean)
      : (rawDetails?.similar?.results || [])
          .slice(0, 4)
          .map((item: any) =>
            type === "movie" ? normalizeTmdbMovie(item) : normalizeTmdbTV(item)
          );

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-12">
      <AppHeader />

      <main className="flex-1 flex flex-col w-full pt-16">
        {/* Backdrop & Header Hero */}
        <div className="relative w-full overflow-hidden bg-[#151C27] border-b border-white/[0.06]">
          {/* Mobile & Tablet Back Button */}
          <div className="lg:hidden absolute top-3.5 left-4 sm:top-5 sm:left-6 z-20">
            <DetailsBackButton fallbackUrl={fallbackUrl} />
          </div>

          {/* Backdrop Image */}
          <div
            className="w-full h-80 sm:h-96 bg-cover bg-center relative"
            style={
              media.backdropPath || media.posterPath
                ? {
                    backgroundImage: `url('${
                      media.backdropPath || media.posterPath
                    }')`,
                  }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-[#0F141D]/70 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F141D]/90 via-transparent to-[#0F141D]/40" />
          </div>

          {/* Overlapping Poster & Information */}
          <div className="max-w-5xl mx-auto px-4 -mt-32 sm:-mt-40 relative z-10 pb-6 flex flex-col gap-4">
            <div className="flex items-end gap-3.5 sm:gap-5">
              {/* Poster 2:3 */}
              <div className="w-28 sm:w-40 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl bg-[#1D2734] border border-white/[0.1] relative">
                {media.posterPath ? (
                  <img
                    src={media.posterPath}
                    alt={media.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-xs text-[#6F7886] p-2 text-center bg-[#161E2C]">
                    <Film className="w-8 h-8 text-white/10 mb-1" />
                    <span>No Poster</span>
                  </div>
                )}
                <span className="absolute top-1.5 left-1.5 bg-[#0F141D]/90 backdrop-blur-sm text-[#F5C84B] px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide flex items-center gap-1 border border-white/[0.08] z-10">
                  <span className="text-[#A8B0BD] text-[9px] font-semibold">IMDb</span>
                  <Star className="w-3 h-3 fill-[#F5C84B]" />
                  <span>{media.rating ? media.rating.toFixed(1) : "—"}</span>
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="flex flex-col justify-end min-w-0 pb-1">
                <div className="flex items-center gap-1.5 flex-wrap mb-1 text-xs">
                  <span className="bg-[#3B9EFF]/20 text-[#3B9EFF] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                    {media.mediaType}
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
                  {media.totalEpisodes > 1 && (
                    <>
                      <span className="text-[#6F7886] font-medium">
                        {media.totalEpisodes} Episodes
                      </span>
                      <span className="text-[#4B5563]">•</span>
                    </>
                  )}
                  <span className="text-[#A8B0BD] font-medium">
                    {media.genres.slice(0, 2).join(", ")}
                  </span>
                </div>

                <h1 className="font-extrabold text-xl sm:text-3xl text-[#F5F7FA] tracking-tight">
                  {media.title}
                </h1>
                {media.originalTitle && media.originalTitle !== media.title && (
                  <p className="text-xs text-[#A8B0BD] italic mt-0.5">
                    {media.originalTitle}
                  </p>
                )}
              </div>
            </div>

            {/* Client Interactive Action Buttons (Add to Library / Rate / Trailer) */}
            <MediaDetailsActions
              media={media}
              initialLog={userLog}
              trailerKey={trailerKey}
              trailerVideos={trailerVideos}
              imdbId={imdbId}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-5xl mx-auto px-4 w-full py-6 flex flex-col gap-6">
          {/* Contextual Curator Review (Only shown when navigated from a user profile with a review) */}
          {contextualReview && (
            <section
              aria-label="Curator Review"
              className="flex flex-col gap-2.5 rounded-2xl bg-gradient-to-b from-[#182333]/90 to-[#121822]/90 border border-[#3B9EFF]/30 p-3.5 sm:p-5 shadow-lg shadow-black/40 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
            >
              {/* Subtle top glow highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3B9EFF]/50 to-transparent" />

              {/* Context Header */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B9EFF] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B9EFF]" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#F5F7FA] tracking-wide">
                    Note from{" "}
                    <Link
                      href={`/u/${contextualReview.author.username}`}
                      className="text-[#3B9EFF] hover:underline font-bold"
                    >
                      @{contextualReview.author.username}
                    </Link>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 hidden sm:inline-block">
                    Curator Dispatch
                  </span>
                </div>

                <Link
                  href={`/u/${contextualReview.author.username}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A8B0BD] hover:text-[#F5F7FA] transition-colors group cursor-pointer"
                >
                  <span>View @{contextualReview.author.username}&apos;s Profile</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Review Card */}
              <ReviewCard
                author={{
                  name: contextualReview.author.fullName || contextualReview.author.username,
                  avatarUrl: contextualReview.author.avatarUrl,
                  isVerified: contextualReview.author.isVerified,
                }}
                mediaTitle={media.title}
                rating={contextualReview.rating}
                containsSpoilers={contextualReview.containsSpoilers}
                reviewText={contextualReview.reviewText}
                likesCount={0}
                commentsCount={0}
                timeAgo={
                  contextualReview.updatedAt
                    ? new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(contextualReview.updatedAt))
                    : "Recently logged"
                }
              />
            </section>
          )}

          {/* Where to Watch (OTT Providers) */}
          <section className="p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#3B9EFF] rounded-full" />
                <h3 className="font-bold text-sm text-[#F5F7FA]">Where to Watch</h3>
                {availableCountry && (
                  <span className="text-[10px] font-bold text-[#6F7886] uppercase tracking-wider bg-white/[0.05] border border-white/[0.06] px-1.5 py-0.5 rounded">
                    {availableCountry}
                  </span>
                )}
              </div>
              {watchUrl ? (
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#3B9EFF] hover:underline flex items-center gap-1 cursor-pointer"
                  title="View all streaming & purchase options on JustWatch"
                >
                  <span>Powered by JustWatch</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[11px] text-[#A8B0BD]">STREAMING AVAILABILITY</span>
              )}
            </div>

            {providers.length > 0 ? (
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                {providers.map((p) => (
                  <div
                    key={p.provider_id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1D2734] border border-white/[0.06] shrink-0"
                  >
                    {p.logo_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                        alt={p.provider_name}
                        className="w-7 h-7 rounded-md object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-[#253244] flex items-center justify-center text-[10px] font-bold text-[#A8B0BD]">
                        {p.provider_name.slice(0, 2)}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-[#F5F7FA] whitespace-nowrap">
                        {p.provider_name}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          p.typeBadge === "Stream"
                            ? "text-[#3B9EFF]"
                            : p.typeBadge === "Free"
                            ? "text-[#22C55E]"
                            : "text-[#A8B0BD]"
                        }`}
                      >
                        {p.typeBadge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6F7886]">
                Streaming information currently unavailable for this title. Check back soon.
              </p>
            )}
          </section>

          {/* Synopsis */}
          <section className="flex flex-col gap-2">
            <h3 className="font-bold text-sm text-[#A8B0BD] uppercase tracking-wider">
              Overview
            </h3>
            <p className="text-sm text-[#dee2ef] leading-relaxed font-sans">
              {media.synopsis || "No description provided."}
            </p>
          </section>

          {/* Official Trailer & Video Clips */}
          {(trailerVideos.length > 0 || imdbId) && (
            <section id="official-trailer" className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#3B9EFF] rounded-full" />
                <h3 className="font-bold text-sm text-[#F5F7FA] uppercase tracking-wider">
                  Official Trailer
                </h3>
              </div>
              <TrailerPlayer
                title={media.title}
                videos={trailerVideos}
                imdbId={imdbId}
              />
            </section>
          )}

          {/* Cast */}
          {castList.length > 0 && (
            <section className="flex flex-col gap-3">
              <h3 className="font-bold text-sm text-[#A8B0BD] uppercase tracking-wider">
                Principal Cast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {castList.map((actor: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-3 rounded-xl bg-[#151C27] border border-white/[0.04]"
                  >
                    {actor.image ? (
                      <img
                        src={actor.image}
                        alt={actor.name}
                        className="w-14 h-14 rounded-full object-cover shadow-sm ring-1 ring-white/10 mb-2"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#1D2734] flex items-center justify-center text-xs font-bold text-[#6F7886] mb-2">
                        {actor.name.slice(0, 2)}
                      </div>
                    )}
                    <span className="font-semibold text-xs text-[#F5F7FA] truncate w-full">
                      {actor.name}
                    </span>
                    <span className="text-[10px] text-[#A8B0BD] truncate w-full mt-0.5">
                      {actor.role}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Member Dispatches */}
          <section className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#3B9EFF] rounded-full" />
                <h3 className="font-bold text-base text-[#F5F7FA]">Member Dispatches</h3>
              </div>
              <span className="text-xs text-[#3B9EFF] font-semibold">WRITE LOG</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {communityReviews.length > 0 ? (
                communityReviews.map((rev) => (
                  <ReviewCard
                    key={rev.id}
                    author={rev.author}
                    mediaTitle={media.title}
                    rating={rev.rating}
                    reviewText={rev.reviewText}
                    containsSpoilers={rev.containsSpoilers}
                    likesCount={0}
                    commentsCount={0}
                    timeAgo={rev.timeAgo}
                  />
                ))
              ) : (
                <>
                  <ReviewCard
                    author={{
                      name: "শৌভিক ভট্টাচার্য (Souvik)",
                      isVerified: true,
                    }}
                    mediaTitle={media.title}
                    rating="masterpiece"
                    reviewText="হিলদুর গুদনাদোত্তিরের শব্দের অনুরণন এবং সিনেমাটোগ্রাফি চলচ্চিত্রটিকে এক অন্য মাত্রায় নিয়ে গেছে। নিস্তব্ধতার যে ওজন থাকতে পারে, তা পরিচালক অত্যন্ত সংবেদনশীলতার সাথে ফুটিয়ে তুলেছেন।"
                    isBengali={true}
                    likesCount={142}
                    commentsCount={29}
                    timeAgo="Recent log"
                  />

                  <ReviewCard
                    author={{
                      name: "Julian Vane",
                      isVerified: false,
                    }}
                    mediaTitle={media.title}
                    rating="good"
                    containsSpoilers={true}
                    reviewText="The second act pacing accelerates relentlessly toward a sequence that fundamentally questions the characters' allegiances. One of the strongest cinematic conclusions this year."
                    likesCount={88}
                    commentsCount={14}
                    timeAgo="2 days ago"
                  />
                </>
              )}
            </div>
          </section>

          {/* Related Titles */}
          {similarItems.length > 0 && (
            <section className="flex flex-col gap-3 mt-2">
              <h3 className="font-bold text-sm text-[#A8B0BD] uppercase tracking-wider">
                Related Resonance
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similarItems.map((item) => (
                  <MediaCard key={item.id} media={item} className="w-full" />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
