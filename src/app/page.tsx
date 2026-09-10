import Link from "next/link";
import { ChevronRight, PenSquare } from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { HeroBanner } from "@/components/media/hero-banner";
import { ShelfRow } from "@/components/media/shelf-row";
import { MediaCard } from "@/components/media/media-card";
import { ContinueWatchingCard } from "@/components/media/continue-watching-card";
import { GenreCard } from "@/components/media/genre-card";
import { ReviewCard } from "@/components/reviews/review-card";
import { tmdb } from "@/lib/tmdb/client";
import { anilist } from "@/lib/anilist/client";
import {
  normalizeTmdbMovie,
  normalizeAniListAnime,
  NormalizedMedia,
} from "@/lib/media/normalize";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const revalidate = 1800; // 30 mins ISR

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch trending movies and anime in parallel
  let trendingMovies: NormalizedMedia[] = [];
  let trendingAnime: NormalizedMedia[] = [];

  try {
    const [tmdbRes, anilistRes] = await Promise.all([
      tmdb.getTrendingMovies("week").catch((e) => {
        console.error("TMDb trending fetch error:", e);
        return { results: [] };
      }),
      anilist.getTrendingAnime(10).catch((e) => {
        console.error("AniList trending fetch error:", e);
        return [];
      }),
    ]);

    trendingMovies = (tmdbRes.results || []).slice(0, 10).map(normalizeTmdbMovie);
    trendingAnime = (anilistRes || []).map(normalizeAniListAnime);
  } catch (err) {
    console.error("Home feed fetch error:", err);
  }

  // Choose featured title for Hero
  const featuredTitle = trendingMovies[0] || {
    id: "tmdb:movie:693134",
    source: "tmdb",
    sourceId: "693134",
    mediaType: "movie",
    title: "Dune: Part Two",
    posterPath: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    backdropPath: "https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
    year: "2024",
    rating: 8.8,
    totalEpisodes: 1,
    runtime: 166,
    genres: ["Sci-Fi", "Adventure"],
    synopsis:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
  };

  // User's active continue watching items
  let continueWatchingList: any[] = [];
  if (user) {
    try {
      const logs = await db
        .select({
          log: userMediaLogs,
          media: mediaItems,
        })
        .from(userMediaLogs)
        .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
        .where(
          and(
            eq(userMediaLogs.userId, user.id),
            eq(userMediaLogs.status, "watching")
          )
        )
        .limit(6);

      continueWatchingList = logs;
    } catch (e) {
      console.error("Continue watching query error:", e);
    }
  }

  // Fallback items for guest experience matching mockups
  const defaultContinueWatching = [
    {
      mediaId: "tmdb:tv:95396",
      sourceId: "95396",
      mediaType: "series" as const,
      title: "Severance",
      episodeName: 'Episode 4 • "Woe\'s Hollow"',
      backdropPath:
        "https://image.tmdb.org/t/p/w780/ixgFmf1X59PUZam2qbAfskx2gQr.jpg",
      posterPath:
        "https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg",
      currentEpisode: 4,
      totalEpisodes: 10,
    },
    {
      mediaId: "anilist:154587",
      sourceId: "154587",
      mediaType: "anime" as const,
      title: "Frieren: Beyond Journey's End",
      episodeName: "Episode 18 • First Class Mage Exam",
      backdropPath:
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-gviZ2zfLIf0w.jpg",
      posterPath:
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-gviZ2zfLIf0w.jpg",
      currentEpisode: 18,
      totalEpisodes: 28,
    },
    {
      mediaId: "tmdb:tv:94605",
      sourceId: "94605",
      mediaType: "series" as const,
      title: "Arcane",
      episodeName: "Season 2 • Episode 3",
      backdropPath:
        "https://image.tmdb.org/t/p/w780/fqldJn2tMkQggQi29HyjewmlvCw.jpg",
      posterPath:
        "https://image.tmdb.org/t/p/w500/abf8tHznhSvl9BAElD23cQaeCDW.jpg",
      currentEpisode: 3,
      totalEpisodes: 9,
    },
  ];

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-12">
      {/* Header */}
      <AppHeader
        user={
          user
            ? {
                email: user.email,
                avatarUrl: user.user_metadata?.avatar_url,
                username: user.user_metadata?.user_name,
              }
            : null
        }
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full pt-16">
        {/* Cinematic Hero */}
        <HeroBanner
          user={
            user
              ? {
                  email: user.email,
                  username: user.user_metadata?.user_name,
                }
              : null
          }
          featuredMedia={featuredTitle}
          secondaryMedia={trendingAnime[0]}
        />

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-2">
          {/* Continue Watching Shelf */}
          <ShelfRow
            title="Continue Watching"
            actionHref="/library?status=watching"
            actionLabel="History"
            accentColor="bg-[#3B9EFF]"
          >
            {continueWatchingList.length > 0
              ? continueWatchingList.map(({ log, media }) => (
                  <ContinueWatchingCard
                    key={log.id}
                    mediaId={media.id}
                    sourceId={media.sourceId}
                    mediaType={media.mediaType as any}
                    title={media.title}
                    currentEpisode={log.episodesWatched || 1}
                    totalEpisodes={media.totalEpisodes || 1}
                    backdropPath={media.backdropPath}
                    posterPath={media.posterPath}
                  />
                ))
              : defaultContinueWatching.map((item) => (
                  <ContinueWatchingCard key={item.mediaId} {...item} />
                ))}
          </ShelfRow>

          {/* Trending Feature Films Shelf */}
          <ShelfRow
            title="Trending Feature Films"
            actionHref="/discover?type=movie"
            actionLabel="Explore all"
            accentColor="bg-[#F5C84B]"
          >
            {trendingMovies.map((movie) => (
              <div key={movie.id} className="w-32 sm:w-40 shrink-0">
                <MediaCard media={movie} />
              </div>
            ))}
          </ShelfRow>

          {/* Anime Simulcasts Shelf */}
          <ShelfRow
            title="Anime Simulcasts"
            badge="Winter 2025"
            actionHref="/discover?type=anime"
            actionLabel="Explore all"
            accentColor="bg-[#3B9EFF]"
          >
            {trendingAnime.map((anime) => (
              <div key={anime.id} className="w-32 sm:w-40 shrink-0">
                <MediaCard media={anime} />
              </div>
            ))}
          </ShelfRow>

          {/* Explore by Genre */}
          <section className="px-4 my-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg sm:text-xl text-[#F5F7FA] tracking-tight">
                  Explore by Genre
                </h2>
                <p className="text-xs text-[#6F7886] mt-0.5">
                  Curated vaults categorized by thematic tone and cinematic structure
                </p>
              </div>
              <Link
                href="/discover"
                className="text-xs font-semibold text-[#6F7886] hover:text-[#F5F7FA] transition-colors flex items-center gap-0.5"
              >
                Full Directory
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <GenreCard
                genre="SCI-FI"
                vaultLabel="Vault"
                vaultColor="text-[#3B9EFF]"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuBqKNsb__pjrt8rqBOhVO2kD-OC3_IsA73L04OjbXZ6R4wJnsmxP-FtT9U4BeL-6uLfR_dYsiDz2st1a1pPSJpkGKm0eFTWtGCrU2z_H7JVSbJ1-pRcg0OsYMRU-HE0BFlsECsqsPZqybLB0GCNpez4IgZfzFw0788ohAHvw561YbmpB3kxJpygQpgWMgR8b98XXCReAFiQysgmI3Hns40R1s2T5sq5fVOVg8TDwI6xfPITYkO7ciLo3A"
                href="/discover?genre=Sci-Fi"
              />
              <GenreCard
                genre="ACTION"
                vaultLabel="Vault"
                vaultColor="text-[#FF9B54]"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDe4Je_JAAtTJKtf6afTSB_FuPt9HTAZsPx8qpbFmoRSVzUX_S1GCKUWK5CVvjti3-AWXI5sV2a7cW5qpYMzJ47Bvn9biG9VgGVqZzPIwVjPzKGg-CCyNKGkmp2yjKfUOraknGvtRV7fJyu_YFm7f82ntqUHaoLO4TqYa0HWgSvvgfrH75xtI3TWaCeFyfMntu5D5KPO4rG-TJEsBAZRpZTILn2z_4hh0e9sf9E-0-KoBPjPsBITb8a3Q"
                href="/discover?genre=Action"
              />
              <GenreCard
                genre="THRILLER"
                vaultLabel="Vault"
                vaultColor="text-[#F43F5E]"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDMHiFdyjS91wid12yb4o2MowHaRtcSp7krD8fmU-rJQqV3whsvFbupbt5wdi9JgsAzIkdPztKiXDb5SnkGyKgal4tScjfTk2PXH_yIELsQxhuAhbxndSJIcc4FsT6QYtSiYwIGyjoTWrsdcBau9OjMCEDpzTleUcKcKPFrSWkAwT2Ay2Ds6-3WKTn92fm8NRE53BlrDkkKwaA__xu7WB-3c1Cf9D-bMbQnHeUKwGiOrVbVsYnmFFSflQ"
                href="/discover?genre=Thriller"
              />
              <GenreCard
                genre="DRAMA"
                vaultLabel="Vault"
                vaultColor="text-[#F5C84B]"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuCqARaK9QT-ZEx7mRikEeMR7LQCUns5HmkcA9sY5YXGYLVhe6duKKvmd7ZICqoD_nBOT3K6zyFF87yfKtPEvI8jj4SBKKdnx2s4hU75q5yf5BBWvf9C8-iW-VpvGB4tpk-wan0vV9Nte4n6K_4QxOo3ZaQ5HcaJCnQKKvgfqJocHyNfUxertqyTSC2WIron2uxYuki-XALSr-TuLoSnX_YONDyxRjFyeiMuNnhR-XtQFiLV2oig7-IDYA"
                href="/discover?genre=Drama"
              />
              <GenreCard
                genre="ANIME"
                vaultLabel="Vault"
                vaultColor="text-[#8BB4F8]"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuCuUraliBjGlOlNFE2q-dbMyKuLTLHR4zmN3v05es4fnI9VdPZBqgZSgLxAE9_cx2GUvsqTIJGDHji5gCv9Xhc3iOQaktCAAtzcPSJFqsdOVVWc9WsptH6ntGCWvqhv-Pmjqx0z5cvnhRHuViCsMlXMFXLa0PD_TkcCiazVlPDgYNabq7SqaWIL6mHOnkykNEJoSeSOJDXhDkJp3R1wO5vBuvOeMMvX1r6VJvYdCbnivb8rv0X3ZHQEsw"
                href="/discover?genre=Anime"
              />
              <GenreCard
                genre="NOIR"
                vaultLabel="Vault"
                vaultColor="text-[#94A3B8]"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuAjcbcTrcIGhVCZ1SmQux3-S_aYTfE1nyalQpYMUS2_d4Mjd2jxCVK6RO232joAdicjQFz-CMigFD8FkHF7a4FpL5Y_i3dsnHlDna83TyfvxNgtC4CEMrqYZB0WyrSzOXCzJ3h9wXwF0gAR4IV24gLPRqj23bX0dju7uhcgGG-unJGGOrJlroORt1cSJ2znSsAs1Q0z_p-Oim3jN5ecCFwsFQjsZ7qX87IBWV6Fy_tpvuq6FgF7204n3g"
                href="/discover?genre=Noir"
              />
            </div>
          </section>

          {/* Editorial & Community Reviews */}
          <section className="px-4 my-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg sm:text-xl text-[#F5F7FA] tracking-tight">
                    Editorial &amp; Community Reviews
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-[#1D2734] text-[10px] font-bold text-[#22C55E] tracking-wider uppercase border border-white/[0.06]">
                    Verified Logs
                  </span>
                </div>
                <p className="text-xs text-[#6F7886] mt-0.5">
                  Critical impressions logged by CineTrack members and accredited critics
                </p>
              </div>
              <button
                type="button"
                className="h-9 px-3.5 rounded-lg bg-[#1A2330] hover:bg-[#243042] text-[#F5F7FA] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/[0.08] cursor-pointer"
              >
                <PenSquare className="w-3.5 h-3.5 text-[#3B9EFF]" />
                <span className="hidden sm:inline">Write a Review</span>
                <span className="sm:hidden">Write</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {/* Review 1: Bilingual Review (Bengali & English) */}
              <ReviewCard
                author={{
                  name: "Anirban Sen",
                  avatarUrl:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAvf9w2OpO98x1I5C3ZgAkFT-UGZ3nouwJuI0tHqHyq33WtWn5tKevFkpyiJgOtVoPug62ptttFbKJRkzQAYjHpGE8No9Ehj703kqjXB7livavGfMXimNXabTM73XweMtMhTML4cSqiaGrWqpM0GrRiZ0t3Yf1dJsrDIX7AwQ5GuDTCuIOLJpUZLjvKVtLlomrfpryzRaemZdVSJV_HjKU7cCeu9CuaJOlwjL2j57MlpPHndfNORJ06rg",
                  isVerified: true,
                  role: "STAFF CRITIC",
                  roleColor: "text-[#3B9EFF]",
                }}
                mediaTitle="Pather Panchali (1955)"
                mediaHref="/movie/500"
                editionTag="4K Restoration"
                rating={9.5}
                bengaliQuote="সত্যজিৎ রায়ের এই মাস্টারপিস প্রতিটি দৃশ্যে প্রকৃতির ছন্দ আর মানুষের অনুভূতির এক বিরল মেলবন্ধন সৃষ্টি করে।"
                reviewText="Subbu's camera floats through rural Bengal with an unflinching yet profoundly tender gaze. The new 4K transfer restores Subrata Mitra’s revolutionary natural lighting to its pristine brilliance."
                likesCount={42}
                commentsCount={8}
                timeAgo="2 hours ago"
              />

              {/* Review 2: Spoiler-Protected Card */}
              <ReviewCard
                author={{
                  name: "Marcus Vance",
                  avatarUrl:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuB0s277pGVr6O6vac0KMRAAgQcBdMRQPbtu3wJlES0SjUWCPDdv8ZXOWK0R_K5zk2PX0zMjkh8U0cXyd1SOx8VSDFvslS-oTuGz3lR3QPvMHhkWZY_yoRo05aFBTpVBvqFHWmFfVLztDlf6b3GHDtwcS26HwKZOmkN7ChDh5p4yig0NJydXqBez0IfDwo59XdS2AaU-xxmeAJ0Vxf7EnAw6KIAApD_Xi1oZSFOD-D7QQVA7rplPlOb62w",
                  isVerified: false,
                  role: "VERIFIED MEMBER",
                  roleColor: "text-[#6F7886]",
                }}
                mediaTitle="Anatomy of a Fall"
                mediaHref="/movie/915935"
                editionTag="Courtroom Drama"
                rating={8.0}
                containsSpoilers={true}
                reviewText="The ambiguity surrounding Daniel's final courtroom testimony is what cements Triet's direction. We never actually know if Sandra orchestrated the recording or if Samuel intentionally induced his own demise. The true trial is memory itself."
                likesCount={89}
                commentsCount={19}
                timeAgo="Yesterday"
              />

              {/* Review 3: Standard Editorial Deep Dive */}
              <ReviewCard
                author={{
                  name: "Elena Rostova",
                  avatarUrl:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCLvzgXbVZaODd2nainiIysJdzwXPY5dE3oLHcyCgpXosvkcSsMV1qoKALKON8lE-kZ2TOfJJPy6Jl93uiUtKMeYBlbfKFj7XjM41k5DBh3OqDrrzMq7Asf-kLGPC1L5ncyIxNqGFb6mNqQY32ymDX1zPJfgXdpj8u2YdSS1-aHzsQy7ZYUspGipkuwmrPJ3lvq3mhTlfzr_0pkDJyIkxtyKZV16RQx7udhKj-bmY-60O6qkgvzaNQcAQ",
                  isVerified: true,
                  role: "CURATOR",
                  roleColor: "text-[#F5C84B]",
                }}
                mediaTitle="Dune: Part Two"
                mediaHref="/movie/693134"
                editionTag="IMAX 70mm"
                rating={9.0}
                reviewText="Greig Fraser’s infrared photography on Giedi Prime is the single most audacious cinematography decision in modern blockbuster history. Villeneuve treats Herbert’s cautionary tale with the solemn reverence of religious mythos."
                likesCount={134}
                commentsCount={31}
                timeAgo="3 days ago"
              />
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <BottomNav />
    </div>
  );
}
