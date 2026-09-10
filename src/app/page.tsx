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

          {/* Explore Categories (2-column mobile grid) */}
          <section className="px-4 my-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#F5C84B] rounded-full" />
                <h2 className="font-bold text-base sm:text-lg text-[#F5F7FA]">
                  Explore Categories
                </h2>
              </div>
              <span className="text-xs text-[#A8B0BD]">6 Curated</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              <GenreCard
                genre="Sci-Fi"
                count="1,420 Films"
                iconName="rocket"
                bgImage="https://image.tmdb.org/t/p/w500/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg"
              />
              <GenreCard
                genre="Action"
                count="2,890 Films"
                iconName="flame"
                bgImage="https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg"
              />
              <GenreCard
                genre="Thriller"
                count="980 Films"
                iconName="eye"
                bgImage="https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
              />
              <GenreCard
                genre="Drama"
                count="3,120 Films"
                iconName="theater"
                bgImage="https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg"
              />
              <GenreCard
                genre="Anime"
                count="1,670 Titles"
                iconName="sparkles"
                bgImage="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-gviZ2zfLIf0w.jpg"
              />
              <GenreCard
                genre="Noir"
                count="450 Films"
                iconName="clapperboard"
                bgImage="https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
              />
            </div>
          </section>

          {/* Community Dispatches (Reviews with Bengali & Spoilers) */}
          <section className="px-4 my-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#3B9EFF] rounded-full" />
                <h2 className="font-bold text-base sm:text-lg text-[#F5F7FA]">
                  Community Dispatches
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[#3B9EFF] tracking-wider uppercase">
                EDITORIAL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Bengali Review Card (From Stitch Mockup) */}
              <ReviewCard
                author={{
                  name: "Arghya Sen",
                  avatarUrl:
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
                  isVerified: true,
                }}
                mediaTitle="Pather Panchali (4K Remaster)"
                rating={9.5}
                reviewText="“সত্যজিৎ রায়ের ফ্রেম কেবল দৃশ্য নয়, অনুভূতির কাব্য। কাশফুলের মধ্য দিয়ে ট্রেনের সেই অবিস্মরণীয় শব্দ আজও সিনেমাপ্রেমীদের বুকে গভীর আলোড়ন তোলে। অপুর চোখের বিস্ময় মানব ইতিহাসের সবচেয়ে খাঁটি চলচিত্র দলিল।”"
                isBengali={true}
                likesCount={142}
                commentsCount={28}
                timeAgo="2 hours ago"
              />

              {/* Spoiler Review Card (From Stitch Mockup) */}
              <ReviewCard
                author={{
                  name: "Elena Rostova",
                  avatarUrl:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
                  isVerified: true,
                }}
                mediaTitle="Severance Season 2"
                rating={9.0}
                containsSpoilers={true}
                reviewText="The reveal at the end of the Lumon testing floor completely turns Mark's motivations upside down. The dual identity resolution is hands down one of the most chilling cliffhangers on television."
                likesCount={89}
                commentsCount={41}
                timeAgo="5 hours ago"
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
