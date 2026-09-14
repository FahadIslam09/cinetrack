import { PageHeader, Panel } from "@/components/admin/panel";
import { Chart } from "@/components/admin/chart";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { DistributionBars } from "@/components/admin/distribution-bars";
import { MediaRankList } from "@/components/admin/media-rank-list";
import { EmptyState } from "@/components/admin/empty-state";
import {
  getUserGrowth,
  getMediaAddedSeries,
  getStatusDistribution,
  getMediaTypeDistribution,
  getPopularMedia,
  getMostRated,
  parseRange,
  RANGE_DAYS,
} from "@/lib/admin/queries";

const STATUS_BARS = {
  watching: { label: "Watching", color: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-emerald-500" },
  plan_to_watch: { label: "Want to Watch", color: "bg-slate-400" },
  on_hold: { label: "On Hold", color: "bg-amber-500" },
  dropped: { label: "Dropped", color: "bg-rose-500" },
} as const;

const TYPE_BARS = {
  movie: { label: "Movies", color: "bg-blue-500" },
  series: { label: "Series", color: "bg-violet-500" },
  anime: { label: "Anime", color: "bg-emerald-500" },
} as const;

export default async function AdminAnalytics({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const rangeKey = parseRange(range);
  const rangeDays = RANGE_DAYS[rangeKey];

  const [
    userGrowth,
    mediaAdded,
    statusDist,
    typeDist,
    popular,
    mostRated,
  ] = await Promise.all([
    getUserGrowth(rangeDays),
    getMediaAddedSeries(rangeDays),
    getStatusDistribution(),
    getMediaTypeDistribution(),
    getPopularMedia(8),
    getMostRated(8),
  ]);

  const statusItems = Object.entries(STATUS_BARS).map(([key, cfg]) => ({
    label: cfg.label,
    color: cfg.color,
    value: statusDist.find((s) => s.status === key)?.count ?? 0,
  }));

  const typeItems = Object.entries(TYPE_BARS).map(([key, cfg]) => ({
    label: cfg.label,
    color: cfg.color,
    value: typeDist.find((t) => t.mediaType === key)?.count ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="User growth, media activity, and distribution across the platform."
        actions={<DateRangePicker rangeKey={rangeKey} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="User Growth" description={`New accounts over the last ${rangeDays} days`}>
          {userGrowth.every((p) => p.value === 0) ? (
            <EmptyState title="No new users" description="No accounts were created during this period." />
          ) : (
            <Chart data={userGrowth} type="area" height={240} />
          )}
        </Panel>
        <Panel title="Media Added Over Time" description={`Library entries added over the last ${rangeDays} days`}>
          {mediaAdded.every((p) => p.value === 0) ? (
            <EmptyState title="No activity" description="No media was added during this period." />
          ) : (
            <Chart data={mediaAdded} type="bar" height={240} color="#10B981" />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Media Type Distribution" description="How the catalog splits by format">
          {typeItems.every((i) => i.value === 0) ? (
            <EmptyState title="No media yet" description="Media will appear here once users start tracking titles." />
          ) : (
            <DistributionBars items={typeItems} />
          )}
        </Panel>
        <Panel title="Watch Status Distribution" description="How users are tracking their titles">
          {statusItems.every((i) => i.value === 0) ? (
            <EmptyState title="No tracking yet" description="Status data will appear as users log titles." />
          ) : (
            <DistributionBars items={statusItems} />
          )}
        </Panel>
        <Panel title="Most Rated" description="Titles with the most submitted ratings">
          {mostRated.length === 0 ? (
            <EmptyState title="No ratings yet" description="Ratings will appear as users rate titles." />
          ) : (
            <MediaRankList items={mostRated} />
          )}
        </Panel>
      </div>

      <Panel title="Most Tracked Media" description="Titles users interact with the most across their libraries">
        {popular.length === 0 ? (
          <EmptyState title="No tracked media yet" description="Popular titles will appear as users build their libraries." />
        ) : (
          <MediaRankList items={popular} />
        )}
      </Panel>
    </div>
  );
}
