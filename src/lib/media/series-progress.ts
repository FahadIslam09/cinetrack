import { SeasonInfo } from "@/app/api/tv/[id]/seasons/route";

export interface SeriesDetails {
  seasons: SeasonInfo[];
  startYear?: string;
  endYear?: string;
  status?: string;
}

// Module-level in-memory cache for series seasons & metadata
const seasonsCache = new Map<string, SeasonInfo[]>();
const seriesMetaCache = new Map<string, SeriesDetails>();
const seasonsPromises = new Map<string, Promise<SeriesDetails>>();

/**
 * Prepopulate cache for known seasons (e.g. demo items or known series)
 */
export function setCachedSeasons(key: string, seasons: SeasonInfo[]) {
  seasonsCache.set(key, seasons);
}

/**
 * Fetch season breakdown and series metadata with automatic deduplication and caching.
 */
export async function getSeriesMetadata(
  sourceId: string,
  source: string = "tmdb",
  totalEpisodes: number = 0
): Promise<SeriesDetails> {
  const cacheKey = `${source}:${sourceId}`;
  if (seriesMetaCache.has(cacheKey)) {
    return seriesMetaCache.get(cacheKey)!;
  }

  if (seasonsPromises.has(cacheKey)) {
    return seasonsPromises.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(
        `/api/tv/${sourceId}/seasons?source=${source}&totalEpisodes=${totalEpisodes}`
      );
      if (!res.ok) throw new Error("Failed to fetch seasons");
      const data = await res.json();
      const seasons: SeasonInfo[] =
        data.seasons && data.seasons.length > 0
          ? data.seasons
          : [{ seasonNumber: 1, name: "Season 1", episodeCount: totalEpisodes || 10 }];

      const details: SeriesDetails = {
        seasons,
        startYear: data.startYear,
        endYear: data.endYear,
        status: data.status,
      };

      seasonsCache.set(cacheKey, seasons);
      seriesMetaCache.set(cacheKey, details);
      return details;
    } catch {
      const fallback: SeriesDetails = {
        seasons: [
          { seasonNumber: 1, name: "Season 1", episodeCount: totalEpisodes || 10 },
        ],
      };
      seasonsCache.set(cacheKey, fallback.seasons);
      seriesMetaCache.set(cacheKey, fallback);
      return fallback;
    } finally {
      seasonsPromises.delete(cacheKey);
    }
  })();

  seasonsPromises.set(cacheKey, promise);
  return promise;
}

/**
 * Fetch season breakdown with automatic in-memory deduplication and caching.
 */
export async function getSeasonsData(
  sourceId: string,
  source: string = "tmdb",
  totalEpisodes: number = 0
): Promise<SeasonInfo[]> {
  const details = await getSeriesMetadata(sourceId, source, totalEpisodes);
  return details.seasons;
}

/**
 * Calculate total watched episodes across all seasons and overall completion percentage.
 */
export function calculateSeriesProgress(
  seasons: SeasonInfo[],
  currentSeason: number = 1,
  currentEpisode: number = 1,
  isCompleted: boolean = false
): { watched: number; total: number; percentage: number } {
  if (!seasons || seasons.length === 0) {
    const total = 10;
    const watched = isCompleted ? total : Math.min(Math.max(currentEpisode, 0), total);
    return {
      watched,
      total,
      percentage: Math.min(100, (watched / total) * 100),
    };
  }

  const sorted = [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
  const total = sorted.reduce((acc, s) => acc + (s.episodeCount || 0), 0) || 1;

  if (isCompleted) {
    return { watched: total, total, percentage: 100 };
  }

  let watched = 0;
  for (const s of sorted) {
    const epsInSeason = s.episodeCount || 0;
    if (s.seasonNumber < currentSeason) {
      watched += epsInSeason;
    } else if (s.seasonNumber === currentSeason) {
      watched += Math.min(Math.max(currentEpisode, 0), epsInSeason);
      break;
    }
  }

  const clampedWatched = Math.min(Math.max(watched, 0), total);
  const percentage = total > 0 ? Math.min(100, (clampedWatched / total) * 100) : 0;

  return { watched: clampedWatched, total, percentage };
}

/**
 * Determine next episode position when user clicks "+1 EP".
 * Handles within-season progression, season transitions, and series completion.
 */
export function getNextEpisodePosition(
  seasons: SeasonInfo[],
  currentSeason: number = 1,
  currentEpisode: number = 1
): {
  nextSeason: number;
  nextEpisode: number;
  isCompleted: boolean;
} {
  if (!seasons || seasons.length === 0) {
    return {
      nextSeason: currentSeason,
      nextEpisode: currentEpisode + 1,
      isCompleted: false,
    };
  }

  const sorted = [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
  let currSeasonIdx = sorted.findIndex((s) => s.seasonNumber === currentSeason);

  if (currSeasonIdx === -1) {
    if (currentSeason >= sorted[sorted.length - 1].seasonNumber) {
      return {
        nextSeason: sorted[sorted.length - 1].seasonNumber,
        nextEpisode: sorted[sorted.length - 1].episodeCount || 10,
        isCompleted: true,
      };
    }
    currSeasonIdx = 0;
  }

  const currSeasonInfo = sorted[currSeasonIdx];
  const maxEpsInCurrSeason = Math.max(1, currSeasonInfo.episodeCount || 10);

  // 1. If not yet at the end of current season, advance to next episode
  if (currentEpisode < maxEpsInCurrSeason) {
    return {
      nextSeason: currSeasonInfo.seasonNumber,
      nextEpisode: currentEpisode + 1,
      isCompleted: false,
    };
  }

  // 2. At end of current season: check if there is another season after this one
  const nextSeasonIdx = currSeasonIdx + 1;
  if (nextSeasonIdx < sorted.length) {
    const nextSeasonInfo = sorted[nextSeasonIdx];
    return {
      nextSeason: nextSeasonInfo.seasonNumber,
      nextEpisode: 1,
      isCompleted: false,
    };
  }

  // 3. At end of final season: complete the series
  return {
    nextSeason: currSeasonInfo.seasonNumber,
    nextEpisode: maxEpsInCurrSeason,
    isCompleted: true,
  };
}
