import { db } from "@/lib/db";
import { userMediaLogs } from "@/lib/db/schema";
import { eq, gte, count } from "drizzle-orm";
import { Library, CheckCircle2, PlayCircle, Clock, PauseCircle, XCircle, Star } from "lucide-react";
import { PageHeader, Panel } from "@/components/admin/panel";
import { StatCard } from "@/components/admin/stat-card";
import { Chart } from "@/components/admin/chart";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { DistributionBars } from "@/components/admin/distribution-bars";
import { MediaRankList } from "@/components/admin/media-rank-list";
import { EmptyState } from "@/components/admin/empty-state";
import {
  getMediaAddedSeries,
  getMostByStatus,
  getPopularMedia,
  getRatingDistribution,
  parseRange,
  RANGE_DAYS,
  daysAgo,
} from "@/lib/admin/queries";

const RATING_BARS: Record<string, { label: string; color: string }> = {
  masterpiece: { label: "Masterpiece", color: "bg-yellow-400" },
  great: { label: "Great", color: "bg-emerald-500" },
  good: { label: "Good", color: "bg-blue-500" },
  average: { label: "Average", color: "bg-amber-500" },
  poor: { label: "Poor", color: "bg-rose-500" },
};

export default async function AdminActivity({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const rangeKey = parseRange(range);
  const rangeDays = RANGE_DAYS[rangeKey];

  const [
    [completed],
    [watching],
    [plan],
    [hold],
    [dropped],
    [addedToday],
    [completedWeek],
    mediaAdded,
    mostCompleted,
    mostTracked,
    ratingDist,
  ] = await Promise.all([
    db.select({ n: count(userMediaLogs.id) }).from(userMediaLogs).where(eq(userMediaLogs.status, "completed")),
    db.select({ n: count(userMediaLogs.id) }).from(userMediaLogs).where(eq(userMediaLogs.status, "watching")),
    db.select({ n: count(userMediaLogs.id) }).from(userMediaLogs).where(eq(userMediaLogs.status, "plan_to_watch")),
    db.select({ n: count(userMediaLogs.id) }).from(userMediaLogs).where(eq(userMediaLogs.status, "on_hold")),
    db.select({ n: count(userMediaLogs.id) }).from(userMediaLogs).where(eq(userMediaLogs.status, "dropped")),
    db.select({ n: count(userMediaLogs.id) }).from(userMediaLogs).where(gte(userMediaLogs.createdAt, daysAgo(1))),
    db.select({ n: count(userMediaLogs.id) }).from(userMediaLogs).where(gte(userMediaLogs.completedAt, daysAgo(7))),
    getMediaAddedSeries(rangeDays),
    getMostByStatus("completed", 8),
    getPopularMedia(8),
    getRatingDistribution(),
  ]);

  const ratingItems = Object.entries(RATING_BARS).map(([key, cfg]) => ({
    label: cfg.label,
    color: cfg.color,
    value: ratingDist.find((r) => r.rating === key)?.count ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Libraries & Activity"
        description="How users are actually tracking media on CineTrack."
        actions={<DateRangePicker rangeKey={rangeKey} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Added Today" value={addedToday?.n ?? 0} icon={Library} iconClassName="bg-blue-50 text-blue-600" />
        <StatCard label="Completed (7d)" value={completedWeek?.n ?? 0} icon={CheckCircle2} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard label="Watching" value={watching?.n ?? 0} icon={PlayCircle} iconClassName="bg-blue-50 text-blue-600" />
        <StatCard label="Completed" value={completed?.n ?? 0} icon={CheckCircle2} iconClassName="bg-emerald-50 text-emerald-600" />
        <StatCard label="Want to Watch" value={plan?.n ?? 0} icon={Clock} iconClassName="bg-slate-100 text-slate-500" />
        <StatCard label="On Hold" value={hold?.n ?? 0} icon={PauseCircle} iconClassName="bg-amber-50 text-amber-600" />
        <StatCard label="Dropped" value={dropped?.n ?? 0} icon={XCircle} iconClassName="bg-rose-50 text-rose-600" />
        <StatCard label="Ratings" value={ratingItems.reduce((s, i) => s + i.value, 0)} icon={Star} iconClassName="bg-yellow-50 text-yellow-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Additions Over Time" description={`Library entries added over the last ${rangeDays} days`}>
            {mediaAdded.every((p) => p.value === 0) ? (
              <EmptyState title="No activity" description="No media was added during this period." />
            ) : (
              <Chart data={mediaAdded} type="bar" height={240} />
            )}
          </Panel>
        </div>
        <Panel title="Rating Distribution" description="How users rate the titles they log">
          {ratingItems.every((i) => i.value === 0) ? (
            <EmptyState title="No ratings yet" description="Ratings will appear as users rate titles." />
          ) : (
            <DistributionBars items={ratingItems} />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Most Completed" description="Titles most frequently marked as completed">
          {mostCompleted.length === 0 ? (
            <EmptyState title="No completions yet" description="Completed titles will appear here." />
          ) : (
            <MediaRankList items={mostCompleted} />
          )}
        </Panel>
        <Panel title="Most Tracked" description="Titles appearing in the most libraries">
          {mostTracked.length === 0 ? (
            <EmptyState title="No tracked media yet" description="Tracked titles will appear here." />
          ) : (
            <MediaRankList items={mostTracked} />
          )}
        </Panel>
      </div>
    </div>
  );
}
