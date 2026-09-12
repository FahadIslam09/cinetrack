import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb/client";
import { anilist } from "@/lib/anilist/client";
import {
  normalizeTmdbMovie,
  normalizeTmdbTV,
  normalizeAniListAnime,
  NormalizedMedia,
} from "@/lib/media/normalize";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { or, ilike } from "drizzle-orm";

export interface ProfileSearchResult {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

const fallbackDemoProfiles: ProfileSearchResult[] = [
  {
    id: "demo-fahad",
    username: "fahad",
    fullName: "Fahad Islam",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Cinema archivist, Sci-Fi enthusiast, and CineTrack developer.",
  },
  {
    id: "demo-alex",
    username: "alex_cinema",
    fullName: "Alex Rivera",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Auteur cinema, 70s crime thrillers, and Japanese New Wave.",
  },
  {
    id: "demo-sarah",
    username: "sarah_films",
    fullName: "Sarah Chen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Anime reviewer and modern television critic.",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const type = searchParams.get("type") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  if (!q) {
    return NextResponse.json({
      media: [],
      profiles: [],
      pagination: {
        page: 1,
        totalPages: 1,
        totalMedia: 0,
        totalProfiles: 0,
      },
      results: [],
    });
  }

  try {
    let mediaResults: NormalizedMedia[] = [];
    let profileResults: ProfileSearchResult[] = [];
    let totalPages = 1;
    let totalMedia = 0;

    // 1. Fetch User Profiles (if type is 'all' or 'profiles')
    if (type === "all" || type === "profiles") {
      try {
        const cleanQ = q.replace(/^@/, "");
        const dbMatches = await db
          .select({
            id: profiles.id,
            username: profiles.username,
            fullName: profiles.fullName,
            avatarUrl: profiles.avatarUrl,
            bio: profiles.bio,
          })
          .from(profiles)
          .where(
            or(
              ilike(profiles.username, `%${cleanQ}%`),
              ilike(profiles.fullName, `%${cleanQ}%`)
            )
          )
          .limit(10);

        if (dbMatches && dbMatches.length > 0) {
          profileResults = dbMatches;
        } else {
          // Fallback to matching demo profiles
          const lowerQ = cleanQ.toLowerCase();
          profileResults = fallbackDemoProfiles.filter(
            (p) =>
              p.username.toLowerCase().includes(lowerQ) ||
              (p.fullName && p.fullName.toLowerCase().includes(lowerQ))
          );
        }
      } catch (profileErr) {
        console.warn("Profile search error:", profileErr);
        const lowerQ = q.replace(/^@/, "").toLowerCase();
        profileResults = fallbackDemoProfiles.filter(
          (p) =>
            p.username.toLowerCase().includes(lowerQ) ||
            (p.fullName && p.fullName.toLowerCase().includes(lowerQ))
        );
      }
    }

    // 2. Fetch Media (if type !== 'profiles')
    if (type !== "profiles") {
      if (type === "anime") {
        const animeResults = await anilist.searchAnime(q, 16);
        mediaResults = animeResults.map(normalizeAniListAnime);
        totalMedia = mediaResults.length;
        totalPages = Math.max(1, Math.ceil(totalMedia / 12));
      } else if (type === "movie") {
        const tmdbRes = await tmdb.searchMovies(q, page).catch(() => ({
          results: [],
          page: 1,
          total_pages: 1,
          total_results: 0,
        }));
        mediaResults = (tmdbRes.results || []).map(normalizeTmdbMovie);
        totalPages = tmdbRes.total_pages || 1;
        totalMedia = tmdbRes.total_results || mediaResults.length;
      } else if (type === "series") {
        const tmdbRes = await tmdb.searchTV(q, page).catch(() => ({
          results: [],
          page: 1,
          total_pages: 1,
          total_results: 0,
        }));
        mediaResults = (tmdbRes.results || []).map(normalizeTmdbTV);
        totalPages = tmdbRes.total_pages || 1;
        totalMedia = tmdbRes.total_results || mediaResults.length;
      } else {
        // "all": query TMDb & AniList in parallel
        const [tmdbRes, animeRes] = await Promise.all([
          tmdb.searchMulti(q, page).catch(() => ({
            results: [],
            page: 1,
            total_pages: 1,
            total_results: 0,
          })),
          page === 1
            ? anilist.searchAnime(q, 6).catch(() => [])
            : Promise.resolve([]),
        ]);

        const tmdbNormalized = (tmdbRes.results || [])
          .map((item) => {
            if (item.media_type === "movie") return normalizeTmdbMovie(item);
            if (item.media_type === "tv") return normalizeTmdbTV(item);
            return null;
          })
          .filter(Boolean) as NormalizedMedia[];

        const animeNormalized = (animeRes || []).map(normalizeAniListAnime);

        // Interleave results naturally
        mediaResults = [...tmdbNormalized, ...animeNormalized];
        totalPages = tmdbRes.total_pages || 1;
        totalMedia = (tmdbRes.total_results || 0) + animeNormalized.length;
      }
    }

    return NextResponse.json({
      media: mediaResults,
      profiles: profileResults,
      pagination: {
        page,
        totalPages: Math.min(totalPages, 50), // TMDb cap limit
        totalMedia,
        totalProfiles: profileResults.length,
      },
      results: mediaResults, // backwards-compatible
    });
  } catch (err: any) {
    console.error("API search error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
