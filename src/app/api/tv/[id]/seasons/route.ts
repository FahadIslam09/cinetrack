import { NextRequest, NextResponse } from "next/server";
import { tmdb } from "@/lib/tmdb/client";

export interface SeasonInfo {
  seasonNumber: number;
  name: string;
  episodeCount: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source") || "tmdb";
    const totalEps = Number(searchParams.get("totalEpisodes")) || 0;

    if (source === "anilist") {
      return NextResponse.json({
        totalSeasons: 1,
        totalEpisodes: totalEps || 12,
        seasons: [
          {
            seasonNumber: 1,
            name: "Season 1",
            episodeCount: totalEps || 12,
          },
        ],
      });
    }

    // TMDb TV Details
    const data = await tmdb.getTVDetails(id);
    const rawSeasons: any[] = data.seasons || [];

    // Filter out specials (season 0) if regular seasons exist
    const validSeasons = rawSeasons.filter(
      (s) => s.season_number > 0 && s.episode_count > 0
    );

    const seasons: SeasonInfo[] = (
      validSeasons.length > 0 ? validSeasons : rawSeasons
    ).map((s) => ({
      seasonNumber: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      episodeCount: s.episode_count,
    }));

    const totalEpisodes =
      data.number_of_episodes ||
      seasons.reduce((acc, s) => acc + s.episodeCount, 0);

    const startYear = data.first_air_date ? data.first_air_date.slice(0, 4) : undefined;
    const endYear = data.last_air_date ? data.last_air_date.slice(0, 4) : undefined;
    const status = data.status;

    return NextResponse.json({
      totalSeasons: data.number_of_seasons || seasons.length,
      totalEpisodes,
      startYear,
      endYear,
      status,
      seasons,
    });
  } catch (err: any) {
    console.error("TV Seasons API error:", err);
    // Graceful fallback: 1 season with default episodes
    return NextResponse.json({
      totalSeasons: 1,
      totalEpisodes: 10,
      seasons: [{ seasonNumber: 1, name: "Season 1", episodeCount: 10 }],
    });
  }
}
