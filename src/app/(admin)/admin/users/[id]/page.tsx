import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Film, Library, MessageSquare, Star, Calendar, CheckCircle2, PlayCircle, Clock, PauseCircle, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { profiles, userMediaLogs, mediaItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PageHeader, Panel } from "@/components/admin/panel";
import { StatusBadge } from "@/components/admin/status-badge";
import { ACCOUNT_STATUS } from "@/components/admin/theme";
import { ActivityList, type ActivityItem } from "@/components/admin/activity-list";
import { EmptyState } from "@/components/admin/empty-state";
import { SuspendButton } from "@/components/admin/suspend-button";
import { getUserLibraryStats } from "@/lib/admin/queries";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetail({ params }: Props) {
  const { id } = await params;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);

  if (!profile) notFound();

  const stats = await getUserLibraryStats(profile.id);

  const recentLogs = await db
    .select({
      id: userMediaLogs.id,
      status: userMediaLogs.status,
      updatedAt: userMediaLogs.updatedAt,
      rating: userMediaLogs.rating,
      reviewText: userMediaLogs.reviewText,
      title: mediaItems.title,
      mediaType: mediaItems.mediaType,
    })
    .from(userMediaLogs)
    .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
    .where(eq(userMediaLogs.userId, profile.id))
    .orderBy(desc(userMediaLogs.updatedAt))
    .limit(12);

  const activity: ActivityItem[] = recentLogs.map((l) => {
    const isReview = Boolean(l.reviewText?.trim());
    const isRated = Boolean(l.rating);
    const action = isReview
      ? { icon: MessageSquare, className: "bg-blue-50 text-blue-600", verb: "Reviewed" }
      : isRated
      ? { icon: Star, className: "bg-amber-50 text-amber-600", verb: "Rated" }
      : l.status === "completed"
      ? { icon: CheckCircle2, className: "bg-emerald-50 text-emerald-600", verb: "Completed" }
      : { icon: Film, className: "bg-slate-100 text-slate-500", verb: "Added" };
    return {
      id: l.id,
      icon: action.icon,
      iconClassName: action.className,
      title: (
        <>
          {action.verb} <span className="font-medium text-slate-900">{l.title}</span>
        </>
      ),
      timestamp: l.updatedAt ? new Date(l.updatedAt).toLocaleDateString() : "",
    };
  });

  const summary = [
    { icon: Library, label: "Library", value: stats.total, className: "text-slate-900" },
    { icon: PlayCircle, label: "Watching", value: stats.watching, className: "text-blue-600" },
    { icon: CheckCircle2, label: "Completed", value: stats.completed, className: "text-emerald-600" },
    { icon: Clock, label: "Want to Watch", value: stats.planToWatch, className: "text-slate-500" },
    { icon: PauseCircle, label: "On Hold", value: stats.onHold, className: "text-amber-600" },
    { icon: XCircle, label: "Dropped", value: stats.dropped, className: "text-rose-600" },
    { icon: MessageSquare, label: "Reviews", value: stats.reviews, className: "text-blue-600" },
    { icon: Star, label: "Ratings", value: stats.ratings, className: "text-amber-600" },
  ];

  const initials = (profile.fullName || profile.username).slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Users
      </Link>

      <PageHeader title="User Detail" />

      {/* Profile header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-semibold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">
              {profile.fullName || profile.username}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-slate-500">@{profile.username}</span>
              <StatusBadge
                colors={ACCOUNT_STATUS[profile.status as "active" | "suspended"] || ACCOUNT_STATUS.active}
              />
              {profile.role === "admin" && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {profile.createdAt.toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile.role !== "admin" && (
              <SuspendButton userId={profile.id} suspended={profile.status === "suspended"} />
            )}
            <Link
              href={`/u/${profile.username}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Activity summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Icon className={`w-4 h-4 ${s.className}`} />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <Panel title="Recent Activity" description="Latest tracking actions by this user">
        {activity.length === 0 ? (
          <EmptyState title="No activity" description="This user hasn't logged any titles yet." />
        ) : (
          <ActivityList items={activity} />
        )}
      </Panel>
    </div>
  );
}
