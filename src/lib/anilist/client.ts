import { tmdb, getTmdbImageUrl } from "@/lib/tmdb/client";

const ANILIST_GRAPHQL_ENDPOINT = "https://graphql.anilist.co";

export interface AniListMedia {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage?: {
    extraLarge?: string;
    large?: string;
    medium?: string;
  };
  bannerImage?: string;
  startDate?: {
    year?: number;
    month?: number;
    day?: number;
  };
  episodes?: number;
  duration?: number; // episode runtime in minutes
  genres?: string[];
  averageScore?: number; // 0-100 scale
  description?: string;
  status?: string;
  characters?: {
    edges?: {
      node: {
        name: { full: string };
        image: { medium: string };
      };
      role: string;
    }[];
  };
  recommendations?: {
    nodes?: {
      mediaRecommendation: any;
    }[];
  };
}

async function fetchAniList<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "CineTrack/1.0",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`AniList GraphQL Error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`AniList Query Error: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

const TRENDING_ANIME_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      startDate {
        year
      }
      episodes
      duration
      genres
      averageScore
      description
    }
  }
}
`;

const SEARCH_ANIME_QUERY = `
query ($search: String, $perPage: Int) {
  Page(page: 1, perPage: $perPage) {
    media(search: $search, type: ANIME, isAdult: false) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
      }
      startDate {
        year
      }
      episodes
      genres
      averageScore
    }
  }
}
`;

const ANIME_DETAILS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    coverImage {
      extraLarge
      large
    }
    bannerImage
    startDate {
      year
    }
    episodes
    duration
    genres
    averageScore
    description(asHtml: false)
    status
    characters(sort: ROLE, perPage: 8) {
      edges {
        node {
          name {
            full
          }
          image {
            medium
          }
        }
        role
      }
    }
    recommendations(perPage: 6) {
      nodes {
        mediaRecommendation {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          averageScore
          startDate {
            year
          }
        }
      }
    }
  }
}
`;

// Helper: map TMDb TV/Movie anime item to AniListMedia shape
function mapTmdbToAnimeMedia(item: any): AniListMedia {
  const title = item.name || item.title || "Untitled";
  const origTitle = item.original_name || item.original_title || title;
  const year = item.first_air_date || item.release_date;
  return {
    id: item.id,
    title: {
      english: title,
      romaji: origTitle,
      native: origTitle,
    },
    coverImage: {
      extraLarge: getTmdbImageUrl(item.poster_path, "w500"),
      large: getTmdbImageUrl(item.poster_path, "w500"),
      medium: getTmdbImageUrl(item.poster_path, "w300"),
    },
    bannerImage: getTmdbImageUrl(item.backdrop_path, "w1280"),
    startDate: {
      year: year ? parseInt(year.slice(0, 4)) : undefined,
    },
    episodes: item.number_of_episodes || 12,
    duration: item.episode_run_time?.[0] || item.runtime || 24,
    genres: item.genres?.map((g: any) => g.name) || ["Anime", "Animation"],
    averageScore: Math.round((item.vote_average || 7.5) * 10),
    description: item.overview || "",
    status: item.status || "RELEASING",
    characters: item.credits?.cast
      ? {
          edges: item.credits.cast.slice(0, 8).map((c: any) => ({
            node: {
              name: { full: c.name },
              image: { medium: getTmdbImageUrl(c.profile_path, "w300") },
            },
            role: c.character || "Voice",
          })),
        }
      : undefined,
    recommendations: item.similar?.results
      ? {
          nodes: item.similar.results.slice(0, 6).map((s: any) => ({
            mediaRecommendation: {
              id: s.id,
              title: { english: s.name || s.title, romaji: s.original_name || s.original_title },
              coverImage: { large: getTmdbImageUrl(s.poster_path, "w500") },
              averageScore: Math.round((s.vote_average || 7.5) * 10),
              startDate: { year: parseInt((s.first_air_date || s.release_date || "2024").slice(0, 4)) },
            },
          })),
        }
      : undefined,
  };
}

export const anilist = {
  getTrendingAnime: async (perPage: number = 10): Promise<AniListMedia[]> => {
    try {
      const data = await fetchAniList<{ Page: { media: AniListMedia[] } }>(
        TRENDING_ANIME_QUERY,
        { page: 1, perPage }
      );
      return data.Page.media;
    } catch (err) {
      console.warn("AniList unavailable, falling back to TMDb Japanese Anime:", err instanceof Error ? err.message : err);
      try {
        const tmdbAnime = await tmdb.discoverTV({
          with_genres: "16",
          with_original_language: "ja",
          sort_by: "popularity.desc",
        });
        return tmdbAnime.results.slice(0, perPage).map(mapTmdbToAnimeMedia);
      } catch (fallbackErr) {
        console.error("TMDb anime fallback failed:", fallbackErr);
        return [];
      }
    }
  },

  searchAnime: async (search: string, perPage: number = 10): Promise<AniListMedia[]> => {
    try {
      const data = await fetchAniList<{ Page: { media: AniListMedia[] } }>(
        SEARCH_ANIME_QUERY,
        { search, perPage }
      );
      return data.Page.media;
    } catch (err) {
      console.warn("AniList search unavailable, falling back to TMDb search:", err instanceof Error ? err.message : err);
      try {
        const tmdbResults = await tmdb.searchMulti(search);
        return tmdbResults.results
          .filter((item: any) => item.genre_ids?.includes(16) || item.original_language === "ja")
          .slice(0, perPage)
          .map(mapTmdbToAnimeMedia);
      } catch {
        return [];
      }
    }
  },

  getAnimeDetails: async (id: number | string): Promise<AniListMedia> => {
    try {
      const data = await fetchAniList<{ Media: any }>(ANIME_DETAILS_QUERY, {
        id: Number(id),
      });
      return data.Media;
    } catch (err) {
      console.warn(`AniList details unavailable for ${id}, falling back to TMDb:`, err instanceof Error ? err.message : err);
      try {
        const tvDetails = await tmdb.getTVDetails(id);
        return mapTmdbToAnimeMedia(tvDetails);
      } catch {
        // Try movie details
        const movieDetails = await tmdb.getMovieDetails(id);
        return mapTmdbToAnimeMedia(movieDetails);
      }
    }
  },
};
