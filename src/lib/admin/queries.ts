import { db } from "@/lib/db";
import {
  profiles,
  mediaItems,
  userMediaLogs,
  featureRequests,
} from "@/lib/db/schema";
import { eq, gte, count, desc, isNotNull } from "drizzle-orm";
import type { ChartPoint } from "@/components/admin/chart";

export type RangeKey = "7" | "30" | "90" | "365";

export const RANGE_DAYS: Record<RangeKey, number> = {
  "7": 7,
  "30": 30,
  "90": 90,
  "365": 365,
};

export function parseRange(raw: string | undefined): RangeKey {
  return raw === "7" || raw === "90" || raw === "365" ? raw : "30";
}

const DAY = 86400000;

type Granularity = "day" | "week" | "month";

function granularityFor(rangeDays: number): Granularity {
  if (rangeDays <= 31) return "day";
  if (rangeDays <= 120) return "week";
  return "month";
}

function fmt(d: Date, g: Granularity): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  if (g === "month") return months[d.getMonth()];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Bucket an array of timestamps into a contiguous time series for the given
 * range. Buckets are contiguous (no gaps) so charts render a smooth axis.
 * ponytail: JS bucketing over in-memory timestamps — fine for the current
 * catalog size; move to date_trunc GROUP BY if logs grow large.
 */
export function buildTimeSeries(dates: Date[], rangeDays: number): ChartPoint[] {
  const g = granularityFor(rangeDays);
  const now = new Date();
  const start = new Date(now.getTime() - rangeDays * DAY);

  // Build bucket boundaries (start of each bucket, oldest first)
  const buckets: { start: Date; label: string }[] = [];
  if (g === "day") {
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    while (cursor.getTime() <= end.getTime()) {
      buckets.push({ start: new Date(cursor), label: fmt(new Date(cursor), g) });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (g === "week") {
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (cursor.getTime() <= now.getTime()) {
      buckets.push({ start: new Date(cursor), label: fmt(new Date(cursor), g) });
      cursor.setDate(cursor.getDate() + 7);
    }
  } else {
    let y = start.getFullYear();
    let m = start.getMonth();
    const cursor = new Date(y, m, 1);
    while (cursor.getTime() <= now.getTime()) {
      buckets.push({ start: new Date(cursor), label: fmt(new Date(cursor), g) });
      m += 1;
      cursor.setFullYear(y + Math.floor(m / 12), m % 12, 1);
      y = cursor.getFullYear();
      m = cursor.getMonth();
    }
  }

  const counts = new Map<string, number>();
  for (const d of dates) {
    const t = d.getTime();
    if (t < start.getTime() || t > now.getTime()) continue;
    let idx = 0;
    if (g === "day") {
      idx = Math.floor((t - buckets[0].start.getTime()) / DAY);
    } else if (g === "week") {
      idx = Math.floor((t - buckets[0].start.getTime()) / (7 * DAY));
    } else {
      idx =
        (d.getFullYear() - buckets[0].start.getFullYear()) * 12 +
        (d.getMonth() - buckets[0].start.getMonth());
    }
    if (idx < 0 || idx >= buckets.length) continue;
    const key = String(idx);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return buckets.map((b, i) => ({
    label: b.label,
    value: counts.get(String(i)) || 0,
  }));
}

export function daysAgo(n: number) {
  return new Date(Date.now() - n * DAY);
}

// ---------------------------------------------------------------------------
// Aggregates
// ---------------------------------------------------------------------------

export async function countRows() {
  const [[users], [media], [logs], [requests]] = await Promise.all([
    db.select({ n: count(profiles.id) }).from(profiles),
    db.select({ n: count(mediaItems.id) }).from(mediaItems),
    db.select({ n: count(userMediaLogs.id) }).from(userMediaLogs),
    db.select({ n: count(featureRequests.id) }).from(featureRequests),
  ]);
  return {
    users: users?.n ?? 0,
    media: media?.n ?? 0,
    logs: logs?.n ?? 0,
    requests: requests?.n ?? 0,
  };
}

export async function getUserGrowth(rangeDays: number): Promise<ChartPoint[]> {
  const since = daysAgo(rangeDays);
  const rows = await db
    .select({ createdAt: profiles.createdAt })
    .from(profiles)
    .where(gte(profiles.createdAt, since));
  return buildTimeSeries(
    rows.map((r) => r.createdAt),
    rangeDays
  );
}

export async function getMediaAddedSeries(rangeDays: number): Promise<ChartPoint[]> {
  const since = daysAgo(rangeDays);
  const rows = await db
    .select({ createdAt: userMediaLogs.createdAt })
    .from(userMediaLogs)
    .where(gte(userMediaLogs.createdAt, since));
  return buildTimeSeries(
    rows.map((r) => r.createdAt),
    rangeDays
  );
}

export interface UserLibraryStats {
  total: number;
  watching: number;
  completed: number;
  planToWatch: number;
  onHold: number;
  dropped: number;
  movies: number;
  series: number;
  anime: number;
  reviews: number;
  ratings: number;
}

export async function getUserLibraryStats(userId: string): Promise<UserLibraryStats> {
  const logs = await db
    .select({
      status: userMediaLogs.status,
      mediaType: mediaItems.mediaType,
      reviewText: userMediaLogs.reviewText,
      rating: userMediaLogs.rating,
    })
    .from(userMediaLogs)
    .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
    .where(eq(userMediaLogs.userId, userId));

  return {
    total: logs.length,
    watching: logs.filter((l) => l.status === "watching").length,
    completed: logs.filter((l) => l.status === "completed").length,
    planToWatch: logs.filter((l) => l.status === "plan_to_watch").length,
    onHold: logs.filter((l) => l.status === "on_hold").length,
    dropped: logs.filter((l) => l.status === "dropped").length,
    movies: logs.filter((l) => l.mediaType === "movie").length,
    series: logs.filter((l) => l.mediaType === "series").length,
    anime: logs.filter((l) => l.mediaType === "anime").length,
    reviews: logs.filter((l) => l.reviewText && l.reviewText.trim()).length,
    ratings: logs.filter((l) => l.rating != null).length,
  };
}

export async function getStatusDistribution() {
  const rows = await db
    .select({ status: userMediaLogs.status, n: count(userMediaLogs.id) })
    .from(userMediaLogs)
    .groupBy(userMediaLogs.status);
  return rows.map((r) => ({ status: r.status, count: r.n }));
}

export async function getMediaTypeDistribution() {
  const rows = await db
    .select({ mediaType: mediaItems.mediaType, n: count(mediaItems.id) })
    .from(mediaItems)
    .groupBy(mediaItems.mediaType);
  return rows.map((r) => ({ mediaType: r.mediaType, count: r.n }));
}

export async function getPopularMedia(limit = 8) {
  const rows = await db
    .select({
      mediaId: userMediaLogs.mediaId,
      title: mediaItems.title,
      posterPath: mediaItems.posterPath,
      mediaType: mediaItems.mediaType,
      n: count(userMediaLogs.id),
    })
    .from(userMediaLogs)
    .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
    .groupBy(
      userMediaLogs.mediaId,
      mediaItems.title,
      mediaItems.posterPath,
      mediaItems.mediaType
    )
    .orderBy(desc(count(userMediaLogs.id)))
    .limit(limit);
  return rows.map((r) => ({
    id: r.mediaId,
    title: r.title,
    posterPath: r.posterPath,
    mediaType: r.mediaType,
    count: r.n,
  }));
}

export async function getMostRated(limit = 8) {
  const rows = await db
    .select({
      mediaId: userMediaLogs.mediaId,
      title: mediaItems.title,
      posterPath: mediaItems.posterPath,
      mediaType: mediaItems.mediaType,
      n: count(userMediaLogs.id),
    })
    .from(userMediaLogs)
    .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
    .where(isNotNull(userMediaLogs.rating))
    .groupBy(
      userMediaLogs.mediaId,
      mediaItems.title,
      mediaItems.posterPath,
      mediaItems.mediaType
    )
    .orderBy(desc(count(userMediaLogs.id)))
    .limit(limit);
  return rows.map((r) => ({
    id: r.mediaId,
    title: r.title,
    posterPath: r.posterPath,
    mediaType: r.mediaType,
    count: r.n,
  }));
}

export async function getMostByStatus(status: string, limit = 8) {
  const rows = await db
    .select({
      mediaId: userMediaLogs.mediaId,
      title: mediaItems.title,
      posterPath: mediaItems.posterPath,
      mediaType: mediaItems.mediaType,
      n: count(userMediaLogs.id),
    })
    .from(userMediaLogs)
    .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
    .where(eq(userMediaLogs.status, status))
    .groupBy(
      userMediaLogs.mediaId,
      mediaItems.title,
      mediaItems.posterPath,
      mediaItems.mediaType
    )
    .orderBy(desc(count(userMediaLogs.id)))
    .limit(limit);
  return rows.map((r) => ({
    id: r.mediaId,
    title: r.title,
    posterPath: r.posterPath,
    mediaType: r.mediaType,
    count: r.n,
  }));
}

export async function getRatingDistribution() {
  const rows = await db
    .select({ rating: userMediaLogs.rating, n: count(userMediaLogs.id) })
    .from(userMediaLogs)
    .where(isNotNull(userMediaLogs.rating))
    .groupBy(userMediaLogs.rating);
  return rows.map((r) => ({ rating: r.rating as string, count: r.n }));
}
