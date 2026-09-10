import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb/client";
import { anilist } from "@/lib/anilist/client";
import {
  normalizeTmdbMovie,
  normalizeTmdbTV,
  normalizeAniListAnime,
  NormalizedMedia,
} from "@/lib/media/normalize";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";

  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    let results: NormalizedMedia[] = [];

    if (type === "anime") {
      const animeResults = await anilist.searchAnime(q, 15);
      results = animeResults.map(normalizeAniListAnime);
    } else if (type === "movie") {
      const tmdbRes = await tmdb.searchMulti(q);
      results = tmdbRes.results
        .filter((item) => item.media_type === "movie")
        .map(normalizeTmdbMovie);
    } else if (type === "series") {
      const tmdbRes = await tmdb.searchMulti(q);
      results = tmdbRes.results
        .filter((item) => item.media_type === "tv")
        .map(normalizeTmdbTV);
    } else {
      // "all": query TMDb & AniList in parallel
      const [tmdbRes, animeRes] = await Promise.all([
        tmdb.searchMulti(q).catch(() => ({ results: [] })),
        anilist.searchAnime(q, 6).catch(() => []),
      ]);

      const tmdbNormalized = (tmdbRes.results || [])
        .slice(0, 10)
        .map((item) => {
          if (item.media_type === "movie") return normalizeTmdbMovie(item);
          if (item.media_type === "tv") return normalizeTmdbTV(item);
          return null;
        })
        .filter(Boolean) as NormalizedMedia[];

      const animeNormalized = (animeRes || []).map(normalizeAniListAnime);

      // Interleave results
      results = [...tmdbNormalized, ...animeNormalized];
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("API search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
