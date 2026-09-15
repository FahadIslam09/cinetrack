import { notFound } from "next/navigation";
import {
  Film,
  Library,
  MessageSquare,
  Star,
  Calendar,
  CheckCircle2,
  PlayCircle,
  Clock,
  PauseCircle,
  XCircle,
  Mail,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Ban,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PageHeader, Panel } from "@/components/admin/panel";
import { StatusBadge } from "@/components/admin/status-badge";
import { ACCOUNT_STATUS } from "@/components/admin/theme";
import { ActivityList, type ActivityItem } from "@/components/admin/activity-list";
import { EmptyState } from "@/components/admin/empty-state";
import {
  getUserDetail,
  getUserLibraryStats,
  getUserAuditLogs,
} from "@/lib/admin/queries";
import { getAdminProfile } from "@/lib/admin/auth";
import { UserActionsHeader } from "@/components/admin/user-actions-header";

interface Props {
  params: Promise<{ id: string }>;
}

function formatAuditAction(action: string): { label: string; className: string } {
  switch (action) {
    case "suspend_user":
      return {
        label: "Suspended",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    case "ban_user":
      return {
        label: "Banned",
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };
    case "restore_user":
      return {
        label: "Restored",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "unban_user":
      return {
        label: "Unbanned",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    default:
      return {
        label: action.replace(/_/g, " "),
        className: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

export default async function AdminUserDetail({ params }: Props) {
  const { id } = await params;
  const currentAdmin = await getAdminProfile();

  const [user, stats, auditLogs] = await Promise.all([
    getUserDetail(id),
    getUserLibraryStats(id),
    getUserAuditLogs(id),
  ]);

  if (!user) notFound();

  // Fetch recent activity logs
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
    .where(eq(userMediaLogs.userId, user.id))
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
      timestamp: l.updatedAt ? new Date(l.updatedAt).toLocaleString() : "",
    };
  });

  const summary = [
    { icon: Library, label: "Total Library", value: stats.total, className: "text-slate-900" },
    { icon: PlayCircle, label: "Watching", value: stats.watching, className: "text-blue-600" },
    { icon: CheckCircle2, label: "Completed", value: stats.completed, className: "text-emerald-600" },
    { icon: Clock, label: "Want to Watch", value: stats.planToWatch, className: "text-slate-500" },
    { icon: PauseCircle, label: "On Hold", value: stats.onHold, className: "text-amber-600" },
    { icon: XCircle, label: "Dropped", value: stats.dropped, className: "text-rose-600" },
    { icon: MessageSquare, label: "Reviews", value: stats.reviews, className: "text-blue-600" },
    { icon: Star, label: "Ratings", value: stats.ratings, className: "text-amber-600" },
  ];

  const initials = (user.fullName || user.username).slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <BackButton
        fallbackUrl="/admin/users"
        label="Back to Users"
        className="text-slate-500 hover:text-slate-800"
      />

      <PageHeader
        title="User Detail"
        description="View account records, library activity, and administrative moderation logs."
      />

      {/* Moderation Alert Banner if Suspended or Banned */}
      {user.status !== "active" && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            user.status === "banned"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          {user.status === "banned" ? (
            <Ban className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1 text-xs leading-relaxed">
            <div className="font-bold text-sm">
              This account is currently {user.status.toUpperCase()}
            </div>
            {user.statusReason ? (
              <p className="mt-1 font-medium">
                <span className="opacity-75">Reason:</span> &ldquo;{user.statusReason}&rdquo;
              </p>
            ) : (
              <p className="mt-1 opacity-75 italic">No specific reason provided.</p>
            )}
            {user.statusUpdatedAt && (
              <div className="mt-1 text-[11px] opacity-75">
                Updated on {new Date(user.statusUpdatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Header Box */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 truncate">
                  {user.fullName || user.username}
                </h2>
                <StatusBadge
                  colors={ACCOUNT_STATUS[user.status] || ACCOUNT_STATUS.active}
                />
                {user.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5">
                    Member
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500 mt-0.5">@{user.username}</div>
              {user.bio && (
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 max-w-xl leading-relaxed">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <UserActionsHeader
              userId={user.id}
              username={user.username}
              role={user.role}
              status={user.status}
              isCurrentAdmin={currentAdmin?.id === user.id}
            />
          </div>
        </div>

        {/* Account Details Meta Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </span>
            <div className="font-semibold text-slate-800 truncate" title={user.email || ""}>
              {user.email || "—"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Sign-In Provider
            </span>
            <div className="font-semibold text-slate-800 capitalize">
              {user.provider || "Email / Password"}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined Date & Time
            </span>
            <div className="font-semibold text-slate-800">
              {new Date(user.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Last Sign-In / Activity
            </span>
            <div className="font-semibold text-slate-800">
              {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : "Never"}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <Icon className={`w-4 h-4 ${s.className}`} />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Moderation Audit History */}
      <Panel
        title="Moderation & Status History"
        description="Audit trail of administrative actions taken on this user"
      >
        {auditLogs.length === 0 ? (
          <EmptyState
            title="No moderation history"
            description="No administrative actions have been taken on this account."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-2.5">Action</th>
                  <th className="px-4 py-2.5">Admin</th>
                  <th className="px-4 py-2.5">Date & Time</th>
                  <th className="px-4 py-2.5">Reason / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => {
                  const act = formatAuditAction(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${act.className}`}
                        >
                          {act.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {log.adminName}
                        <span className="font-normal text-slate-400 ml-1">
                          (@{log.adminUsername})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-md">
                        {log.reason ? (
                          <span className="italic">&ldquo;{log.reason}&rdquo;</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Recent User Tracking Activity */}
      <Panel
        title="Recent Tracking Activity"
        description="Latest titles logged, reviewed, and rated by this user"
      >
        {activity.length === 0 ? (
          <EmptyState
            title="No activity"
            description="This user hasn't logged or rated any titles yet."
          />
        ) : (
          <ActivityList items={activity} />
        )}
      </Panel>
    </div>
  );
}
