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
    logo: "https://image.tmdb.org/t/p/w92/rK1KljqmbvO9HQa1PBFLILWah72.png",
  },
  {
    id: "prime",
    name: "Prime Video",
    tmdbId: "9|119",
    logo: "https://image.tmdb.org/t/p/w92/gMZdpavHmxFNnLpMHwVxfqeux2g.png",
  },
  {
    id: "disney",
    name: "Disney+",
    tmdbId: "337",
    logo: "https://image.tmdb.org/t/p/w92/5eZ872CghnHFLB1j8grszbrx0dx.png",
  },
  {
    id: "apple",
    name: "Apple TV+",
    tmdbId: "350",
    logo: "https://image.tmdb.org/t/p/w92/9icYBfYFcwgCbky5VdGUIKJ4C5i.png",
  },
  {
    id: "max",
    name: "Max",
    tmdbId: "1899",
    logo: "https://image.tmdb.org/t/p/w92/skypuy7SXuugIQeYg0IglmzoKaS.png",
  },
  {
    id: "hulu",
    name: "Hulu",
    tmdbId: "15",
    logo: "https://image.tmdb.org/t/p/w92/44uAnmSqvA4yBOdbPWN8YgQHjWm.png",
  },
  {
    id: "paramount",
    name: "Paramount+",
    tmdbId: "531",
    logo: "https://image.tmdb.org/t/p/w92/pkx3klJlwW5JdtaulvDx6hDNtch.png",
  },
  {
    id: "peacock",
    name: "Peacock",
    tmdbId: "386",
    logo: "https://image.tmdb.org/t/p/w92/8GCjHi76yPE7kqjc9ykNVHIZtCv.png",
  },
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    tmdbId: "283",
    logo: "https://image.tmdb.org/t/p/w92/uFL3c4Cq8M6WoLymlC5Y8bmGytV.png",
  },
  {
    id: "jio",
    name: "JioHotstar",
    tmdbId: "2336",
    logo: "https://image.tmdb.org/t/p/w92/ledoS6EgdjTNq8F1e6wubUQer18.png",
  },
  {
    id: "zee5",
    name: "Zee5",
    tmdbId: "232",
    logo: "https://image.tmdb.org/t/p/w92/uQvhdtB8skccsGHmvKi3y5bqBsX.png",
  },
  {
    id: "sonyliv",
    name: "Sony LIV",
    tmdbId: "237",
    logo: "https://image.tmdb.org/t/p/w92/coM4QWbmIOa0xJ5cGR9BRmoV25B.png",
  },
  {
    id: "hoichoi",
    name: "Hoichoi",
    tmdbId: "315",
    logo: "https://image.tmdb.org/t/p/w92/8dgAD4EzQWMsyudVwWCFg19998L.png",
  },
  {
    id: "chorki",
    name: "Chorki",
    tmdbId: "chorki",
    logo: "/chorki.png",
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
