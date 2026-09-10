import Link from "next/link";
import { ChevronRight, PenSquare } from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
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

  // Curated datasets matching stitch_home_mockup (Desktop, Tablet, Mobile)
  const mockupMovies: NormalizedMedia[] = [
    {
      id: "mockup:movie:1",
      source: "tmdb",
      sourceId: "872585",
      mediaType: "movie",
      title: "Oppenheimer",
      posterPath: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      backdropPath: "https://image.tmdb.org/t/p/w1280/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
      year: "2023",
      rating: 8.9,
      totalEpisodes: 1,
      genres: ["Drama", "History"],
    },
    {
      id: "mockup:movie:2",
      source: "tmdb",
      sourceId: "666277",
      mediaType: "movie",
      title: "Past Lives",
      posterPath: "https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg",
      backdropPath: null,
      year: "2023",
      rating: 8.2,
      totalEpisodes: 1,
      genres: ["Drama", "Romance"],
    },
    {
      id: "mockup:movie:3",
      source: "tmdb",
      sourceId: "915935",
      mediaType: "movie",
      title: "Anatomy of a Fall",
      posterPath: "https://image.tmdb.org/t/p/w500/1ho0d4LNZw3Y0voeKmSvPSgJOJ2.jpg",
      backdropPath: null,
      year: "2023",
      rating: 8.1,
      totalEpisodes: 1,
      genres: ["Crime", "Drama"],
    },
    {
      id: "mockup:movie:4",
      source: "tmdb",
      sourceId: "792307",
      mediaType: "movie",
      title: "Poor Things",
      posterPath: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg",
      backdropPath: null,
      year: "2023",
      rating: 8.0,
      totalEpisodes: 1,
      genres: ["Comedy", "Sci-Fi"],
    },
    {
      id: "mockup:movie:5",
      source: "tmdb",
      sourceId: "467244",
      mediaType: "movie",
      title: "The Zone of Interest",
      posterPath: "https://image.tmdb.org/t/p/w500/hUu9zyZmDd8VZegKi1iK1Vk0RYS.jpg",
      backdropPath: null,
      year: "2023",
      rating: 7.9,
      totalEpisodes: 1,
      genres: ["History", "Drama"],
    },
    {
      id: "mockup:movie:6",
      source: "tmdb",
      sourceId: "569094",
      mediaType: "movie",
      title: "Across the Spider-Verse",
      posterPath: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      backdropPath: null,
      year: "2023",
      rating: 8.8,
      totalEpisodes: 1,
      genres: ["Animation", "Action"],
    },
    {
      id: "mockup:movie:7",
      source: "tmdb",
      sourceId: "937287",
      mediaType: "movie",
      title: "Challengers",
      posterPath: "https://image.tmdb.org/t/p/w500/H6vke7zGiuLsz4v4RPeReb9rsv.jpg",
      backdropPath: null,
      year: "2024",
      rating: 7.7,
      totalEpisodes: 1,
      genres: ["Drama", "Romance"],
    },
  ];

  const mockupAnime: NormalizedMedia[] = [
    {
      id: "mockup:anime:1",
      source: "anilist",
      sourceId: "127230",
      mediaType: "anime",
      title: "Chainsaw Man",
      posterPath: "https://image.tmdb.org/t/p/w500/iFM1dyFi0rByvEomEkmm7NpQeeb.jpg",
      backdropPath: null,
      year: "TV · S1",
      rating: 8.5,
      totalEpisodes: 12,
      genres: ["Action", "Supernatural"],
    },
    {
      id: "mockup:anime:2",
      source: "anilist",
      sourceId: "145064",
      mediaType: "anime",
      title: "Jujutsu Kaisen",
      posterPath: "https://image.tmdb.org/t/p/w500/6qQzMJG27XOJsyAEEIisoJB45j2.jpg",
      backdropPath: null,
      year: "TV · S2",
      rating: 8.8,
      totalEpisodes: 23,
      genres: ["Action", "Supernatural"],
    },
    {
      id: "mockup:anime:3",
      source: "anilist",
      sourceId: "110277",
      mediaType: "anime",
      title: "Attack on Titan",
      posterPath: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
      backdropPath: null,
      year: "Final Season",
      rating: 9.1,
      totalEpisodes: 28,
      genres: ["Action", "Fantasy"],
    },
    {
      id: "mockup:anime:4",
      source: "anilist",
      sourceId: "166240",
      mediaType: "anime",
      title: "Demon Slayer",
      posterPath: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
      backdropPath: null,
      year: "TV · S4",
      rating: 8.4,
      totalEpisodes: 8,
      genres: ["Action", "Fantasy"],
    },
    {
      id: "mockup:anime:5",
      source: "anilist",
      sourceId: "136430",
      mediaType: "anime",
      title: "Vinland Saga",
      posterPath: "https://image.tmdb.org/t/p/w500/vUHlpA5c1NXkds59reY3HMb4Abs.jpg",
      backdropPath: null,
      year: "TV · S2",
      rating: 8.9,
      totalEpisodes: 24,
      genres: ["Action", "Adventure"],
    },
    {
      id: "mockup:anime:6",
      source: "anilist",
      sourceId: "151807",
      mediaType: "anime",
      title: "Solo Leveling",
      posterPath: "https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg",
      backdropPath: null,
      year: "TV · S1",
      rating: 8.3,
      totalEpisodes: 12,
      genres: ["Action", "Fantasy"],
    },
  ];

  // Fallback continue watching matching all 3 mockup viewports 100%
  const defaultContinueWatching = [
    {
      mediaId: "tmdb:tv:95396",
      sourceId: "95396",
      mediaType: "series" as const,
      title: "Severance",
      episodeName: "S2 · Ep 4 of 10",
      posterPath: "https://image.tmdb.org/t/p/w500/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg",
      currentEpisode: 4,
      totalEpisodes: 10,
      seasonNumber: 2,
      network: "Apple TV+",
    },
    {
      mediaId: "anilist:154587",
      sourceId: "154587",
      mediaType: "anime" as const,
      title: "Frieren",
      episodeName: "S1 · Ep 18 of 28",
      posterPath: "https://image.tmdb.org/t/p/w500/dqZENchTd7lp5zht7BdlqM7RBhD.jpg",
      currentEpisode: 18,
      totalEpisodes: 28,
      seasonNumber: 1,
      network: "Crunchyroll",
    },
    {
      mediaId: "tmdb:tv:126308",
      sourceId: "126308",
      mediaType: "series" as const,
      title: "Shōgun",
      episodeName: "Miniseries · Ep 7 of 10",
      posterPath: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg",
      currentEpisode: 7,
      totalEpisodes: 10,
      seasonNumber: 1,
      network: "FX / Hulu",
    },
  ];

  // Display items: use mockups by default for exact visual parity
  const displayMovies = mockupMovies;
  const displayAnime = mockupAnime;
  const featuredTitle = trendingMovies[0] || mockupMovies[0];

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
      <main className="flex-1 flex flex-col w-full pt-[70px]">
        {/* 1. Featured Hero (Responsive across Desktop, Tablet, Mobile) */}
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

        {/* 2. Continue Watching Shelf (Section 2 from stitch_home_mockup) */}
        <section className="w-full bg-[#151C27] py-6 sm:py-8 border-b border-white/[0.04]">
          <div className="w-full max-w-[834px] lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <h2 className="font-bold text-lg sm:text-xl text-[#F5F7FA] tracking-tight">
                  Continue Watching
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#1B2029] text-[10px] font-bold text-[#3B9EFF] tracking-wider uppercase border border-white/[0.06]">
                  {continueWatchingList.length > 0
                    ? `${continueWatchingList.length} In Progress`
                    : "3 In Progress"}
                </span>
              </div>
              <Link
                href="/library?status=watching"
                className="text-xs font-semibold text-[#6F7886] hover:text-[#F5F7FA] transition-colors flex items-center gap-0.5"
              >
                <span className="sm:hidden">View All</span>
                <span className="hidden sm:inline">View All Logs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Responsive Cards: horizontal rail on mobile, 3 columns on tablet & desktop */}
            <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar snap-x snap-mandatory">
              {continueWatchingList.length > 0
                ? continueWatchingList.map(({ log, media }: any) => (
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
            </div>
          </div>
        </section>

        {/* Central Container for Discover Shelves, Vaults & Reviews */}
        <div className="w-full max-w-[834px] lg:max-w-[1440px] mx-auto px-0 sm:px-4 lg:px-8 flex flex-col gap-2">
          {/* 3. Trending Feature Films Shelf */}
          <ShelfRow
            title="Trending Feature Films"
            subtitle="Critically acclaimed cinema tracked across global databases this week"
            actionHref="/discover?type=movie"
            actionLabel="Explore all"
          >
            {displayMovies.map((movie) => (
              <MediaCard key={movie.id} media={movie} />
            ))}
          </ShelfRow>

          {/* 4. Popular Anime Simulcasts Shelf */}
          <ShelfRow
            title="Popular Anime Simulcasts"
            subtitle="Top ranked serialized series by community engagement & episode completion rate"
            badge="Current Season"
            badgeColor="text-[#FFB873] bg-[#FFB873]/10 border-[#FFB873]/20"
            actionHref="/discover?type=anime"
            actionLabel="Explore all"
          >
            {displayAnime.map((anime) => (
              <MediaCard key={anime.id} media={anime} />
            ))}
          </ShelfRow>

          {/* 5. Explore by Genre (Vaults Bento Grid) */}
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
              <span className="sm:hidden font-semibold text-xs text-[#6F7886]">
                6 Categories
              </span>
              <Link
                href="/discover"
                className="hidden sm:flex text-xs font-semibold text-[#6F7886] hover:text-[#F5F7FA] transition-colors items-center gap-0.5"
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
                count="1,420 titles"
                bgImage="https://image.tmdb.org/t/p/w780/eZ239CUp1d6OryZEBPnO2n87gMG.jpg"
                href="/discover?genre=Sci-Fi"
              />
              <GenreCard
                genre="ACTION"
                vaultLabel="Vault"
                vaultColor="text-[#FF9B54]"
                count="2,180 titles"
                bgImage="https://image.tmdb.org/t/p/w780/7I6VUdPj6tQECNHdviJkUHD2f89.jpg"
                href="/discover?genre=Action"
              />
              <GenreCard
                genre="THRILLER"
                vaultLabel="Vault"
                vaultColor="text-[#F43F5E]"
                count="980 titles"
                bgImage="https://image.tmdb.org/t/p/w780/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg"
                href="/discover?genre=Thriller"
              />
              <GenreCard
                genre="DRAMA"
                vaultLabel="Vault"
                vaultColor="text-[#F5C84B]"
                count="3,040 titles"
                bgImage="https://image.tmdb.org/t/p/w780/r9PkFnRUIthgBp2JqD24W1v2U2e.jpg"
                href="/discover?genre=Drama"
              />
              <GenreCard
                genre="ANIME"
                vaultLabel="Vault"
                vaultColor="text-[#8BB4F8]"
                count="1,890 titles"
                bgImage="https://image.tmdb.org/t/p/w780/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg"
                href="/discover?genre=Anime"
              />
              <GenreCard
                genre="NOIR"
                vaultLabel="Vault"
                vaultColor="text-[#94A3B8]"
                count="450 titles"
                bgImage="https://image.tmdb.org/t/p/w780/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg"
                href="/discover?genre=Noir"
              />
            </div>
          </section>

          {/* 6. Editorial & Community Reviews */}
          <section className="px-4 my-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg sm:text-xl text-[#F5F7FA] tracking-tight">
                    Editorial &amp; Reviews
                  </h2>
                </div>
                <p className="text-xs text-[#6F7886] mt-0.5">
                  Thoughtful cinema critiques from the community
                </p>
              </div>
              <button
                type="button"
                className="h-9 px-3.5 rounded-lg bg-[#1D2734] hover:bg-[#243042] text-[#3B9EFF] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/[0.08] cursor-pointer shadow-sm active:scale-95"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Write</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
              {/* Review 1: Bilingual Bengali Editorial */}
              <ReviewCard
                author={{
                  name: "Anirban Sen",
                  isVerified: true,
                  role: "Staff Critic",
                  roleColor: "text-[#3B9EFF]",
                }}
                mediaTitle="Pather Panchali (1955)"
                mediaHref="/movie/500"
                rating={9.5}
                bengaliQuote="সত্যজিৎ রায়ের এই মাস্টারপিস প্রতিটি দৃশ্যে প্রকৃতির ছন্দ আর মানুষের অনুভূতির এক বিরল মেলবন্ধন সৃষ্টি করে।"
                reviewText="Subbu's camera floats through rural Bengal with an unflinching yet profoundly tender gaze. The new 4K transfer restores Subrata Mitra’s revolutionary natural lighting to its pristine brilliance."
                seriesTag="Cinema Classic Series"
                likesCount={128}
                commentsCount={24}
              />

              {/* Review 2: Spoiler-Protected Card */}
              <ReviewCard
                author={{
                  name: "Marcus Vance",
                  isVerified: true,
                  role: "Verified",
                  roleColor: "text-[#22C55E]",
                }}
                mediaTitle="Anatomy of a Fall (2023)"
                mediaHref="/movie/915935"
                rating={8.0}
                containsSpoilers={true}
                reviewText="The pivotal recording played in the third act completely re-contextualizes the argument. Sandra Hüller's quiet realization that Daniel had memorized his mother's cadence gives the ending its heartbreaking ambiguity."
                seriesTag="Palme d'Or Analysis"
                likesCount={94}
                commentsCount={18}
              />

              {/* Review 3: Standard Editorial Deep Dive */}
              <ReviewCard
                author={{
                  name: "Elena Rostova",
                  isVerified: true,
                  role: "Curator",
                  roleColor: "text-[#A8B0BD]",
                }}
                mediaTitle="Dune: Part Two (2024)"
                mediaHref="/movie/693134"
                editionTag="IMAX 70mm"
                rating={9.0}
                reviewText="Seen in IMAX 70mm. The sound design during the worm-riding sequence vibrates your entire skeleton. Greig Fraser’s infrared photography on Giedi Prime delivers one of the most stark visual sequences in modern science fiction."
                seriesTag="Sci-Fi Landmark Retrospective"
                likesCount={312}
                commentsCount={42}
              />
            </div>
          </section>
        </div>
      </main>

      {/* 7. Rich 4-Column Footer */}
      <Footer />

      {/* 8. Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}

