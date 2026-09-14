import Link from "next/link";
import { Bell, Lightbulb, Bug, MessageSquare, ExternalLink } from "lucide-react";
import { PageHeader, Panel } from "@/components/admin/panel";
import { EmptyState } from "@/components/admin/empty-state";
import { StatusBadge } from "@/components/admin/status-badge";
import { REQUEST_STATUS } from "@/components/admin/theme";
import { db } from "@/lib/db";
import { featureRequests, profiles } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminNotifications() {
  const [unreadRes] = await db
    .select({ n: count(featureRequests.id) })
    .from(featureRequests)
    .where(eq(featureRequests.status, "new"));

  const requests = await db
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
    .limit(20);

  const unreadCount = unreadRes?.n ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Feedback Feed"
        description="Live activity stream of user feature requests, bug submissions, and system alerts."
        actions={
          <Link
            href="/admin/requests"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            Manage Feature Requests
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Unreviewed Inquiries</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{unreadCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Recorded</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{requests.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Feed Status</p>
          <p className="text-sm font-semibold text-emerald-600 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Live &amp; Synchronized
          </p>
        </div>
      </div>

      <Panel title="Incoming Community Feed" description="Newest requests and reports submitted by CineTrack visitors">
        {requests.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No incoming notifications yet"
            description="When visitors submit feature requests, bug reports, or contact inquiries, they will appear in this feed."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((req) => {
              const isNew = req.status === "new";
              const Icon =
                req.category === "bug"
                  ? Bug
                  : req.category === "feature"
                  ? Lightbulb
                  : MessageSquare;
              const iconColor =
                req.category === "bug"
                  ? "text-rose-600 bg-rose-50"
                  : req.category === "feature"
                  ? "text-blue-600 bg-blue-50"
                  : "text-purple-600 bg-purple-50";

              return (
                <div
                  key={req.id}
                  className={`py-3.5 px-3 -mx-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isNew ? "bg-blue-50/40" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {req.title}
                        </span>
                        {isNew && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-700">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {req.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>
                          From{" "}
                          <span className="text-slate-600 font-medium">
                            {req.username ? `@${req.username}` : req.email || "Anonymous user"}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          {req.createdAt ? new Date(req.createdAt).toLocaleString() : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <StatusBadge
                      colors={
                        REQUEST_STATUS[req.status as keyof typeof REQUEST_STATUS] ||
                        REQUEST_STATUS.new
                      }
                    />
                    <Link
                      href="/admin/requests"
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
