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
}

async function fetchAniList<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
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

export const anilist = {
  getTrendingAnime: async (perPage: number = 10) => {
    const data = await fetchAniList<{ Page: { media: AniListMedia[] } }>(
      TRENDING_ANIME_QUERY,
      { page: 1, perPage }
    );
    return data.Page.media;
  },

  searchAnime: async (search: string, perPage: number = 10) => {
    const data = await fetchAniList<{ Page: { media: AniListMedia[] } }>(
      SEARCH_ANIME_QUERY,
      { search, perPage }
    );
    return data.Page.media;
  },

  getAnimeDetails: async (id: number | string) => {
    const data = await fetchAniList<{ Media: any }>(ANIME_DETAILS_QUERY, {
      id: Number(id),
    });
    return data.Media;
  },
};
