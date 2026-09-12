export interface OttProvider {
  id: string;
  name: string;
  tmdbId: string;
  logo: string;
}

export const OTT_PROVIDERS: OttProvider[] = [
  {
    id: "netflix",
    name: "Netflix",
    tmdbId: "8",
    logo: "https://image.tmdb.org/t/p/w92/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg",
  },
  {
    id: "prime",
    name: "Prime Video",
    tmdbId: "9|119",
    logo: "https://image.tmdb.org/t/p/w92/mxeBtA4jdwqV738A5M09j96s4f3.jpg",
  },
  {
    id: "disney",
    name: "Disney+",
    tmdbId: "337",
    logo: "https://image.tmdb.org/t/p/w92/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg",
  },
  {
    id: "apple",
    name: "Apple TV+",
    tmdbId: "350",
    logo: "https://image.tmdb.org/t/p/w92/2E03HGHYNvTzsgL82EBZh3NZUBD.jpg",
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    tmdbId: "283",
    logo: "https://image.tmdb.org/t/p/w92/8N0DNa4miA2WTY5Kk2t1qF3p9u.jpg",
  },
  {
    id: "max",
    name: "Max",
    tmdbId: "1899",
    logo: "https://image.tmdb.org/t/p/w92/fksCUZ9QDWZMUwL2Lgq5M6o0W4z.jpg",
  },
  {
    id: "hoichoi",
    name: "Hoichoi",
    tmdbId: "315",
    logo: "https://image.tmdb.org/t/p/w92/uG2w6bYy6v64p1w0A5W2gM0m3k.jpg",
  },
];

export const DISCOVER_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
] as const;

export const TMDB_MOVIE_GENRES: Record<string, string> = {
  action: "28",
  adventure: "12",
  animation: "16",
  comedy: "35",
  crime: "80",
  documentary: "99",
  drama: "18",
  fantasy: "14",
  horror: "27",
  mystery: "9648",
  romance: "10749",
  "sci-fi": "878",
  thriller: "53",
};

export const TMDB_TV_GENRES: Record<string, string> = {
  action: "10759",
  adventure: "10759",
  animation: "16",
  comedy: "35",
  crime: "80",
  documentary: "99",
  drama: "18",
  fantasy: "10765",
  horror: "27",
  mystery: "9648",
  romance: "10749",
  "sci-fi": "10765",
  thriller: "53",
};
