import { getTmdbImageUrl } from "../tmdb/client";

export interface NormalizedMedia {
  id: string; // 'tmdb:movie:123', 'tmdb:tv:456', 'anilist:789'
  source: "tmdb" | "anilist";
  sourceId: string;
  mediaType: "movie" | "series" | "anime";
  title: string;
  originalTitle?: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate?: string;
  year?: string;
  rating: number; // 0.0 - 10.0 scale
  totalEpisodes: number;
  runtime?: number; // in minutes
  genres: string[];
  synopsis?: string;
  streamingProviders?: Record<
    string,
    Array<{ provider_id: number; provider_name: string; logo_path: string }>
  >;
}

export function normalizeTmdbMovie(item: any): NormalizedMedia {
  const releaseDate = item.release_date || "";
  const year = releaseDate ? releaseDate.slice(0, 4) : undefined;
  const rating = item.vote_average ? Number(item.vote_average.toFixed(1)) : 0;

  return {
    id: `tmdb:movie:${item.id}`,
    source: "tmdb",
    sourceId: String(item.id),
    mediaType: "movie",
    title: item.title || item.original_title || "Untitled",
    originalTitle: item.original_title,
    posterPath: getTmdbImageUrl(item.poster_path, "w500"),
    backdropPath: item.backdrop_path ? getTmdbImageUrl(item.backdrop_path, "w1280") : null,
    releaseDate,
    year,
    rating,
    totalEpisodes: 1,
    runtime: item.runtime || undefined,
    genres: item.genres?.map((g: any) => g.name) || [],
    synopsis: item.overview,
    streamingProviders: item["watch/providers"]?.results || {},
  };
}

export function normalizeTmdbTV(item: any): NormalizedMedia {
  const releaseDate = item.first_air_date || "";
  const year = releaseDate ? releaseDate.slice(0, 4) : undefined;
  const rating = item.vote_average ? Number(item.vote_average.toFixed(1)) : 0;

  return {
    id: `tmdb:tv:${item.id}`,
    source: "tmdb",
    sourceId: String(item.id),
    mediaType: "series",
    title: item.name || item.original_name || "Untitled",
    originalTitle: item.original_name,
    posterPath: getTmdbImageUrl(item.poster_path, "w500"),
    backdropPath: item.backdrop_path ? getTmdbImageUrl(item.backdrop_path, "w1280") : null,
    releaseDate,
    year,
    rating,
    totalEpisodes: item.number_of_episodes || 1,
    runtime: item.episode_run_time?.[0] || undefined,
    genres: item.genres?.map((g: any) => g.name) || [],
    synopsis: item.overview,
    streamingProviders: item["watch/providers"]?.results || {},
  };
}

export function normalizeAniListAnime(item: any): NormalizedMedia {
  const title = item.title?.english || item.title?.romaji || item.title?.native || "Untitled";
  const year = item.startDate?.year ? String(item.startDate.year) : undefined;
  const rating = item.averageScore ? Number((item.averageScore / 10).toFixed(1)) : 0;

  return {
    id: `anilist:${item.id}`,
    source: "anilist",
    sourceId: String(item.id),
    mediaType: "anime",
    title,
    originalTitle: item.title?.native || item.title?.romaji,
    posterPath: item.coverImage?.extraLarge || item.coverImage?.large || null,
    backdropPath: item.bannerImage || null,
    releaseDate: year ? `${year}-01-01` : undefined,
    year,
    rating,
    totalEpisodes: item.episodes || 1,
    runtime: item.duration || undefined,
    genres: item.genres || [],
    synopsis: item.description?.replace(/<[^>]*>/g, ""), // strip raw HTML tags
  };
}
