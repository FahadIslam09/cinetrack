import { Users, UserPlus, Film, Library, MessageSquare, Lightbulb, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { profiles, mediaItems, userMediaLogs, featureRequests } from "@/lib/db/schema";
import { desc, gte, lt, and, isNotNull, count, countDistinct, eq } from "drizzle-orm";
import { StatCard } from "@/components/admin/stat-card";
import { Panel, PageHeader } from "@/components/admin/panel";
import { Chart } from "@/components/admin/chart";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { ActivityList, type ActivityItem } from "@/components/admin/activity-list";
import { StatusBadge } from "@/components/admin/status-badge";
import { REQUEST_STATUS } from "@/components/admin/theme";
import { EmptyState } from "@/components/admin/empty-state";
import {
  countRows,
  getUserGrowth,
  getMediaAddedSeries,
  parseRange,
  RANGE_DAYS,
  daysAgo,
} from "@/lib/admin/queries";

const STATUS_ICON: Record<string, { icon: ActivityItem["icon"]; className: string; verb: string }> = {
  completed: { icon: Activity, className: "bg-emerald-50 text-emerald-600", verb: "Completed" },
  watching: { icon: Library, className: "bg-blue-50 text-blue-600", verb: "Started" },
  plan_to_watch: { icon: Film, className: "bg-slate-100 text-slate-500", verb: "Added" },
  on_hold: { icon: Library, className: "bg-amber-50 text-amber-600", verb: "Paused" },
  dropped: { icon: Library, className: "bg-rose-50 text-rose-600", verb: "Dropped" },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const rangeKey = parseRange(range);
  const rangeDays = RANGE_DAYS[rangeKey];

  const totals = await countRows();

  const [
    [newToday],
    [newWeek],
    [newMonth],
    [newPrevMonth],
    [active],
    [reviewCount],
    [ratingCount],
  ] = await Promise.all([
    db.select({ n: count(profiles.id) }).from(profiles).where(gte(profiles.createdAt, daysAgo(1))),
    db.select({ n: count(profiles.id) }).from(profiles).where(gte(profiles.createdAt, daysAgo(7))),
    db.select({ n: count(profiles.id) }).from(profiles).where(gte(profiles.createdAt, daysAgo(30))),
    db
      .select({ n: count(profiles.id) })
      .from(profiles)
      .where(and(gte(profiles.createdAt, daysAgo(60)), lt(profiles.createdAt, daysAgo(30)))),
    db
      .select({ n: countDistinct(userMediaLogs.userId) })
      .from(userMediaLogs)
      .where(gte(userMediaLogs.updatedAt, daysAgo(30))),
    db
      .select({ n: count(userMediaLogs.id) })
      .from(userMediaLogs)
      .where(isNotNull(userMediaLogs.reviewText)),
    db
      .select({ n: count(userMediaLogs.id) })
      .from(userMediaLogs)
      .where(isNotNull(userMediaLogs.rating)),
  ]);

  const growthPct =
    (newPrevMonth?.n || 0) > 0
      ? Math.round((((newMonth?.n || 0) - newPrevMonth.n) / newPrevMonth.n) * 100)
      : 0;

  const mediaTypeCounts = await db
    .select({ mediaType: mediaItems.mediaType, n: count(mediaItems.id) })
    .from(mediaItems)
    .groupBy(mediaItems.mediaType);

  const mediaByType = { movie: 0, series: 0, anime: 0 };
  for (const r of mediaTypeCounts) {
    mediaByType[r.mediaType as keyof typeof mediaByType] = r.n;
  }

  const [userGrowth, mediaAdded, recentLogs, pendingRequests, recentRequests] = await Promise.all([
    getUserGrowth(rangeDays),
    getMediaAddedSeries(rangeDays),
    db
      .select({
        id: userMediaLogs.id,
        status: userMediaLogs.status,
        updatedAt: userMediaLogs.updatedAt,
        mediaTitle: mediaItems.title,
        username: profiles.username,
      })
      .from(userMediaLogs)
      .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
      .leftJoin(profiles, eq(userMediaLogs.userId, profiles.id))
      .orderBy(desc(userMediaLogs.updatedAt))
      .limit(8),
    db
      .select({ status: featureRequests.status, n: count(featureRequests.id) })
      .from(featureRequests)
      .groupBy(featureRequests.status),
    db
      .select({
        id: featureRequests.id,
        title: featureRequests.title,
        description: featureRequests.description,
        category: featureRequests.category,
        status: featureRequests.status,
        createdAt: featureRequests.createdAt,
        username: profiles.username,
        email: featureRequests.email,
      })
      .from(featureRequests)
      .leftJoin(profiles, eq(featureRequests.userId, profiles.id))
      .orderBy(desc(featureRequests.createdAt))
      .limit(4),
  ]);

  const requestCountMap = new Map<string, number>();
  for (const r of pendingRequests) {
    requestCountMap.set(r.status, r.n);
  }
  const pendingNew = requestCountMap.get("new") || 0;
  const pendingReview = requestCountMap.get("under_review") || 0;

  const activity: ActivityItem[] = recentLogs.map((l) => {
    const s = STATUS_ICON[l.status] || STATUS_ICON.plan_to_watch;
    return {
      id: l.id,
      icon: s.icon,
      iconClassName: s.className,
      title: (
        <>
          <span className="font-medium text-slate-900">
            {l.username ? `@${l.username}` : "A user"}
          </span>{" "}
          {s.verb.toLowerCase()}{" "}
          <span className="font-medium text-slate-900">{l.mediaTitle}</span>
        </>
      ),
      timestamp: l.updatedAt ? new Date(l.updatedAt).toLocaleDateString() : "",
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A snapshot of who is using CineTrack, what they're tracking, and what needs your attention."
        actions={<DateRangePicker rangeKey={rangeKey} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={totals.users} icon={Users} delta={growthPct} deltaLabel="vs last 30d" />
        <StatCard
          label="New This Week"
          value={newWeek?.n ?? 0}
          icon={UserPlus}
          iconClassName="bg-emerald-50 text-emerald-600"
          hint={`${newToday?.n ?? 0} today`}
        />
        <StatCard
          label="Active Users (30d)"
          value={active?.n ?? 0}
          icon={Activity}
          iconClassName="bg-violet-50 text-violet-600"
          hint="tracked or updated media"
        />
        <StatCard
          label="Library Entries"
          value={totals.logs}
          icon={Library}
          iconClassName="bg-amber-50 text-amber-600"
          hint={`${reviewCount?.n ?? 0} reviews · ${ratingCount?.n ?? 0} ratings`}
        />
        <StatCard
          label="Total Media"
          value={totals.media}
          icon={Film}
          iconClassName="bg-sky-50 text-sky-600"
          hint={`${mediaByType.movie} movies · ${mediaByType.series} series · ${mediaByType.anime} anime`}
        />
        <StatCard
          label="Reviews"
          value={reviewCount?.n ?? 0}
          icon={MessageSquare}
          iconClassName="bg-rose-50 text-rose-600"
          hint={`${ratingCount?.n ?? 0} ratings submitted`}
        />
        <StatCard
          label="Feature Requests"
          value={totals.requests}
          icon={Lightbulb}
          iconClassName="bg-blue-50 text-blue-600"
          hint={`${pendingNew} new · ${pendingReview} under review`}
        />
        <StatCard
          label="Growth (MoM)"
          value={`${growthPct}%`}
          icon={TrendingUp}
          iconClassName="bg-emerald-50 text-emerald-600"
          hint="month-over-month users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="User Growth" description={`New accounts over the last ${rangeDays} days`}>
          {userGrowth.every((p) => p.value === 0) ? (
            <EmptyState title="No new users" description="No accounts were created during this period." />
          ) : (
            <Chart data={userGrowth} type="area" height={220} />
          )}
        </Panel>
        <Panel title="Media Added" description={`Library entries added over the last ${rangeDays} days`}>
          {mediaAdded.every((p) => p.value === 0) ? (
            <EmptyState title="No activity" description="No media was added during this period." />
          ) : (
            <Chart data={mediaAdded} type="bar" height={220} color="#10B981" />
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          title="Recent Activity"
          description="Latest tracking actions across the platform"
          actions={
            <Link href="/admin/activity" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View all
            </Link>
          }
        >
          {activity.length === 0 ? (
            <EmptyState title="No activity yet" description="Tracking activity will appear here." />
          ) : (
            <ActivityList items={activity} />
          )}
        </Panel>

        <Panel
          title="Needs Attention"
          description="Feature requests awaiting review"
          actions={
            <Link href="/admin/requests" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Manage
            </Link>
          }
        >
          {totals.requests === 0 ? (
            <EmptyState title="No feature requests yet" description="Requests submitted on the site will appear here." />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(["new", "under_review", "in_progress"] as const).map((s) => {
                  const n = requestCountMap.get(s) || 0;
                  return (
                    <Link
                      key={s}
                      href={`/admin/requests?status=${s}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <StatusBadge colors={REQUEST_STATUS[s]} />
                      <span className="text-sm font-semibold text-slate-900">{n}</span>
                    </Link>
                  );
                })}
              </div>

              {recentRequests.length > 0 && (
                <div className="divide-y divide-slate-100 border-t border-slate-100 pt-1">
                  {recentRequests.map((req) => (
                    <div
                      key={req.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 truncate">
                            {req.title}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            {req.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          From {req.username ? `@${req.username}` : req.email || "Anonymous"} •{" "}
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge
                          colors={
                            REQUEST_STATUS[req.status as keyof typeof REQUEST_STATUS] ||
                            REQUEST_STATUS.new
                          }
                        />
                        <Link
                          href="/admin/requests"
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
