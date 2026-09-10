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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCQxdA-5PQ-FJ1jBS7ByKX-pp4xHGERuBNVlG42mtLu1tpbXlWYLX66nfIyrxPGDtaBsuPPHECFLn_G1XsctB3NsT9-ED-GCfbWlscRgnsHoWYzZznlCsxhs_L4MLTpqsoqN2qV998Znxjgfk4Sb-jRdfLorQCZvDAu5Gg1pvW0O5D7Dn5wN0a9Jk9teCs7IUQUtgC6trpztQnUsLqHRNWV58ab1tVZSHWHHaeKTeDijPrUCcSKqlpExw",
      backdropPath: null,
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCjbf208Df2LKhf61-iMpnY0AgOSe8WVAobf4WB3XFUFAknM5EcBPZtkpaf8zO4XXA_n7scOJpu2G9EsfD8AqLSqtnydifRPzVUsopU01Z4U35ayU3uP930xMWZB4B2GSVTyTacZ4vqozwyJpNF1waN1BM-dY1z_WsADWUsORKqhAy9i-SpmY9FqgdDpDFnadXuyG1aonrS_yyObSgPOJdM2w-7P6bkaM4e0-VU6HhlRci8dKrMvJbgmw",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD-jJwF4iiLVv6ch2WJh4PRm1TuhbvMg94cMj3ay8PX7pXBM-1V4G37IwmZK5GGrrZKFZ6-WYSDnFujFHBRqsUBNdxw7B6lCvj91clgqB4gsoib-6EfdJxcEpjH456uBWWQncGamuTDRVtBNkxM0M2_LkU5xbqaS1qICYsVX16ww7ixDq9xVywxpMfnxlCK1_M5l7mEz3fBtArAy95mX4mEHOTD7YC0kL32HPw6g8v9-T4adbEFOeHJ5g",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDMt_vq2vsgrUot-Qz2r57fyCkYJnGg_WN_Y-ufbLhLR4IwpJO_94ptyRXJPmCn7SCYGaN4d-9IJ45fSmb_cIMDlMIVPK611pbX3fa9iIRmSuXwr2-bqIngp4sxhNd5WCgc21wQzHK8co00-mB9I0KL0f0DpSbfzZRNQxYBVep2wMG23n9ER4G6083brYsTXin5G9S1QkNUW1Pz3p8M95zzCDl2w-psItWAR95zbMD4w4MF2oxOLq1-Xw",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAy63tVD_yvK6WWPuGPQMSi-qsUo7iFR4k7q2PnFMzpFTTfJzKxZVwXmJqWroVPOsuqkIE7prwkOBhuTrH3uK7p2YQaf5UplDrahGoBry23wormutnjiCdb96rvMcYv9CGwHHR-ZXoZ5Pc5oKkErBsmBXFEYP_uretYAd0KcQr1UJZ8JlhEBgpJV31RVquc-yYMHYatoj5UbCQa78cSg6vJ-oKvRtXeWHNHGuvM-DhMgN5-CvpyjpSgmA",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD-YmM3q9v7AfX3eO8sAAxYAmmSS2afBpRjWtFbzkHczvuyPC02tOmLCfYbxDYTayC5fLPNffIrsRTfMLBPX7Qz5F9pll1nVlefi3w_rsVrXRRwc0lhc07xhgMIhdReA7ZFatEbPV8xRMeT0O967SbHgh4PspHKk5Tv2eUSe2d1-WpjmkWdZ1nE628GW2DBWaD3zEwsumsLsHHDh8DA0Hh1EMvtoV5WLKGOgSF9B6TDmqebM557xaR5Gw",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAhQBAw1f_DaFntt5vuJ6wOzfm4fjYTauWwHZA5eCPHvnpX7MhmUaVKQImFSw8NkzEQWtPbxLGi4ymcrd5KkfadAT18zmr_wrMz0BKfOWlAnDQw0gg4ApFjs7dMtCenA6HIP3pmOYZkhvqjp8_BuMXb254II6eUxukGeZ4NA8jLs_EPd1uyD4Cdg9YNUpynw_JpF4Q03A6v5oEE3W_WQp9KixvQBzDPzrTt36HOkQse5uZH6JmWpGgNVQ",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuARP3Eq1AqAADXC-yBvepA8PuCJ2Ngpla8WIWtBp8sSem9S5yTlqxfYdAXh2pYskYbn8C577eYafkexGd4YRqp-3ZvXTSC5R5ziaWzysREdp8DmABzWr--cGw4q1RQy38L8vGttA1wOA_Th2U0ATmRvkNxgQk6A-IAFpeeYvN3saqdD-V6I__Ldecm8w0uO-vf_urhXosqBfm7cwl-A96BA_8K-WOgW7MYYR2jAJBjGqgjtLii--PLEQQ",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCELT4Y88TU2WznWCG8cl7gwb1NjNoIhlRp9YAzhAt2AUH--A2tLhpAW2cj3-e2TH6yOkBJWZb1bmTetgoiIVkSBxhD5bPWWcE0GXhUSCfYquVye-ebrRosrhJA2aT6UjhpR5QvkzrqJyt6X13-LNrLzUuoxj3rIx7pJmTKR4G89qU0g1pOeIXp01bZPPpo92Ety8IlGNzfKuuyFWYF_wE3_eMgFlBNQgKNcszeh9CasgDwrpijPr-7UA",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD1uGJGxnrrCPkjm7aBg5JT8zlfxLg0nqUJWp6J3EsDq1YHtCvl-NTDvdEoiIVbIHiOVnsq9bMSvdBkfoquU1pfxSlHemp-DHTHPwIRaj8qEkUr69zTyZI8isiL5lRa3nu9nIvFbAk8Mk-CEB3Jx5E21eNv6rCXNR0pkB8DO7G22XL_-94SF0gILYYQ0AHAJnPDdL7KnzLiygv40IzwoBlCOo7t3OEPBWwCHw2K8my4jWoBPmHazzdyTA",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCR1Y8MqncJ0kInJJ-Ztjmidta7Pp8iHU4Uutd1zd24JqFJYpBYmD5-cu9L6KrZQSXm43m7cxuGW2cAJ9SqYblkkPfiCukIs5mvtAoyTyuSdCy_H9MjTBqZI3Mdf6LoA0RI9_ThFBY85z9OYfssfR_8YiIYuLVg3uavqxJvdlFDS-iOcl2BxNdMhgGkYhJmbwKvKlXeY9vuvGgA4jWVUfDt4uYh_ozdHzg826jopexgqxcbwHDY3Ar3nw",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuClt97IAonD8Y4vNI2in9CiBMQJ0U_I9iPs4YwjdXIgZDFtywtTsDCDMsuM7cKxOyG99MfmWy5_d-FkC9_9js4SPWxs7gZoUVRBkaSh3jiIOAjo5N1uDekXznbcVMGFHTtUUgIeAKMbE8HGR3S42Rp8R9DKptWoqdKR4L2jSnr_9Tg6U0pxKOERFtMUglFGU-fgwi4hoeqjMFTgM6Mh14nZsXg_lW9UuqvXBo2Z5ptmT3g0kFUtgKdN6Q",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBjLQCZCLNtUWmFzjKNY6bPbQKKasREmFA_OlyFa2FV3b2c_-SeRT4Odc76mYVjL-Kcv_prs2w8OyfyuFD0bbPmQFAgW5aO7iuA_DUVHoqbaZkZV58gvjjZQL1xV-pGRCS5BNEPVv8UcS8cdkmyeqSTTTgLoeunFA-ZaUjt15OYMQRNS4WPBtGKIFE8CyaTsiorbs7jJHJPt_bk-M4efAaiYELE0S_IGjbqufizQsAa6yjJxa2nAu7-TA",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCKd8Srwo0pyzLHzQ1u07Okb900IZ78Ng28Nwp8xRMjVWFOUw5G-OWGygbBjEtQaqkvKsSa6X8LkMCSMRCQsZ6HEXsyNh5nRU9Pac9i9XBbIoRWgCMhsg1LKQ9Z_DizrcCfQyb6SuR34SlaSh-Jo2W9BlRFDN270Qxd15GHBIUO0GyNTeRD0sRd6xw9W5abBc3CJNA8RT_YXh7SXj_KJwfUqEproEkP2g0Q_UZxNY6871oJNgegK7P4Ig",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDg1NTbyu2eOQ9nS6kl0Xq8c4ZHwyV7qJSWwoRAAj2cET2lLnULFXg-VZIp1pFNBJ7jcezh_4Y-3wdXjrgpJkAOCF8LW89hkbT7XWma7pWrM1q_ERoeV-PqCPyigcVvia0cBCWkH0ue732A0LTOy-DecZFyN2gbPLQr372SeAQdwT3dc3Hk_dGtWQdI8jYjZ6Ed6Re8oBI35DJElNYgP6cCeSml8o4wcL6A3r0ynqXhJ6II-rxzC1o2cw",
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
      posterPath:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDkffOGGbWAsDZimHAI-ArRt8gLFDhlPD1o95E5XL2oulgeBB7-pgyk7AkvKlFNqJZycd4E3SwWAh7C-J-Vt92W5B3BRjSHjfnb5-6xxKHNkGhwJ_vLARc285IhsGZiBxXuk0-VYObJjpgORJGB4340eoEBiniNLArN4Z-Nk2Xm2nIP_X0HcC-ZovxaCq6utsRKo63-jW3jVEi63uCRHuv7S37GGzHUkPCT72b_GXiC7dGloAohn0PjOQ",
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
            <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 no-scrollbar snap-x snap-mandatory">
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
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuBDjt02_RkeaZjD14JC_89hLZBGRy6HpII811LcgWI4k8t7PZHuh7lMk9sJbTs9ctk9Fzy077nVE3IwWqHc4dj1vC3r4YwVxIfktmm8yTQQ8LvUNsBj5HCFKC9cEofVRSjPxeBnKrRrAPVir8xaiYI6zcuxq32QLI0cQg5CxdduJke4GN-qHgt04nL86q08n9dQO4sEm3PlvDM00i5E571oOF3YlYU7Ztq9q5jB7qu68L7Zg-3lNurnUw"
                href="/discover?genre=Sci-Fi"
              />
              <GenreCard
                genre="ACTION"
                vaultLabel="Vault"
                vaultColor="text-[#FF9B54]"
                count="2,180 titles"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuB6qzQRwwHnpB4dm2Oo028nprw6179VmzN1PHsyw7crQXIbp_1ovNjD711vr0UXfW0ldlb1YIVTzCtaQj2sX1perUyjOeh8vR8ltGIap45iMITwuYCW49EJ3Ok7LwouICJXtX5xHBoPwiLaY34aafYzrCRa4j4VRjWqU2HH9Cxs4tn47U9TF50aPfZs3dzzMyKscQwlMeY2rpn_4CLPsIqQVXGH-FxnBMFwU2yfaVHmfMioNqliYBiHXQ"
                href="/discover?genre=Action"
              />
              <GenreCard
                genre="THRILLER"
                vaultLabel="Vault"
                vaultColor="text-[#F43F5E]"
                count="980 titles"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuBfsMjT-FX9xxCoToW-MCs8KXPFORj6q0J0ZUS1QXeAu6ZaBpbtgdzqg7MhHBGjz264dF33vSSMg3-J4dpAKskauVdH7q681Te5Y4DBiWi0FdYL8l-Cf1DyPJtU9LI5QJabjUHo4Ow4nN8DOxmdqlsXlKZ4WGjw6_EGZJIoMmmgwaVs6zBA5Is1xEhplVHTrv1evfWieOblpyk-frPLSmL1eOo6VGYSBrDrKCv5c8SgULcbvaJfSmjzmw"
                href="/discover?genre=Thriller"
              />
              <GenreCard
                genre="DRAMA"
                vaultLabel="Vault"
                vaultColor="text-[#F5C84B]"
                count="3,040 titles"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDVQRFgGeDhyjFxRDGXNm2JzwryGXBBWVWATUIWVZvdH0Hvc76OEtRQar7ZuisaQ1dLp_TbwS7-aTKvOgaXtmDfQpiMxQVK3pJrqbQGoOlbEKH2hXh2fNagQADuvq6B-77NQzj-GdbFfR5TcqNWVtCAd_frelXRWY8eCFTe1VhfogL_N1-mxwwrrmpp02tZ3qqgcSV-f5iiVhXZpX7szwIWyW-aCF6Jn-HbiedBI_umZN0NtPnCPzM7Yw"
                href="/discover?genre=Drama"
              />
              <GenreCard
                genre="ANIME"
                vaultLabel="Vault"
                vaultColor="text-[#8BB4F8]"
                count="1,890 titles"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDSlh9H9M5tP4RhkDG_B-QDpaktvHa9CsSBpSf05vnoUONWODmTrYWUceu2Y45oHab5T1-JknN6btS1zuo8pBh7kOF1s3zu-YNJCooZqehoTfwRz70Gbv3lZLb2e2Iu-Afol-Tf2GMfjBTMCe4Xv18eqJVsndL5TPajlbG_xkXlakDD_0ASRSgrlIs6-Aalqd7B-7ye0Efkur5beOYIws_qszcbqCqfRp6aOGHYIJsmMbLYFj9oqmg5eg"
                href="/discover?genre=Anime"
              />
              <GenreCard
                genre="NOIR"
                vaultLabel="Vault"
                vaultColor="text-[#94A3B8]"
                count="450 titles"
                bgImage="https://lh3.googleusercontent.com/aida-public/AB6AXuDIr7Ujn4N0D4MEIIZpbtZSL1Ls7Sd9BE-KohYwa7i3U7XMjSrtBwZSRCfEls87Sa0XNJY1Rey-9pxEKkqhQdGMrXd5QFXJ7gY3v7jS09DvflH3vt76Md6mX820KeT9u4zESDwAJ7Yfk1Uw9acQjS0KTRXw7VskK8W85z_UFlSTmZQ8pG4q4zsYwOgr_x2eDpMx_pAw2jplCxSXWC0Qb39BEGNoqDyN7fVZR9sOWMSnhTKxrYqkG6D-5g"
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

