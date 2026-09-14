import { db } from "@/lib/db";
import { featureRequests, profiles } from "@/lib/db/schema";
import { or, ilike, eq } from "drizzle-orm";
import { PageHeader, Panel } from "@/components/admin/panel";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { REQUEST_STATUS, REQUEST_STATUS_ORDER, PRIORITY, REQUEST_CATEGORY } from "@/components/admin/theme";
import { SearchBar, FilterSelect } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { Chart } from "@/components/admin/chart";
import { RequestEditDialog } from "@/components/admin/request-edit-dialog";
import { buildTimeSeries } from "@/lib/admin/queries";

const PAGE_SIZE = 20;

type RequestRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  adminNotes: string | null;
  createdAt: Date;
  username: string | null;
  email: string | null;
};

interface Props {
  searchParams: Promise<{ q?: string; status?: string; sort?: string; page?: string }>;
}

export default async function AdminRequests({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status || "all";
  const sort = params.sort || "newest";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const rows = await db
    .select({
      id: featureRequests.id,
      title: featureRequests.title,
      description: featureRequests.description,
      category: featureRequests.category,
      status: featureRequests.status,
      priority: featureRequests.priority,
      adminNotes: featureRequests.adminNotes,
      createdAt: featureRequests.createdAt,
      username: profiles.username,
      email: featureRequests.email,
    })
    .from(featureRequests)
    .leftJoin(profiles, eq(featureRequests.userId, profiles.id))
    .where(
      q
        ? or(ilike(featureRequests.title, `%${q}%`), ilike(featureRequests.description, `%${q}%`))
        : undefined
    );

  const mapped: RequestRow[] = rows.map((r) => ({ ...r }));

  const filtered = mapped.filter((r) => status === "all" || r.status === status);

  filtered.sort((a, b) => {
    if (sort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
    if (sort === "status") {
      const ai = REQUEST_STATUS_ORDER.indexOf(a.status as any);
      const bi = REQUEST_STATUS_ORDER.indexOf(b.status as any);
      if (ai !== bi) return ai - bi;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const summary = REQUEST_STATUS_ORDER.map((s) => ({
    status: s,
    count: mapped.filter((r) => r.status === s).length,
  }));

  const total = filtered.length;
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const trend = buildTimeSeries(
    mapped.map((r) => r.createdAt),
    90
  );

  const columns: Column<RequestRow>[] = [
    {
      key: "request",
      header: "Request",
      primary: true,
      render: (r) => (
        <div className="min-w-0 max-w-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 truncate">{r.title}</span>
            <StatusBadge colors={REQUEST_CATEGORY[r.category as keyof typeof REQUEST_CATEGORY] || REQUEST_CATEGORY.general} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{r.description}</p>
          {r.adminNotes && (
            <p className="text-[11px] text-slate-400 mt-1 italic truncate">Note: {r.adminNotes}</p>
          )}
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (r) => (
        <span className="text-xs text-slate-600">
          {r.username ? `@${r.username}` : r.email || "Anonymous"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge colors={REQUEST_STATUS[r.status as keyof typeof REQUEST_STATUS] || REQUEST_STATUS.new} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (r) => <StatusBadge colors={PRIORITY[r.priority as keyof typeof PRIORITY] || PRIORITY.medium} />,
    },
    {
      key: "date",
      header: "Date",
      render: (r) => <span className="text-xs text-slate-500">{r.createdAt.toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <RequestEditDialog id={r.id} status={r.status} priority={r.priority} adminNotes={r.adminNotes} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Requests"
        description="Review and manage what users are asking for."
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {summary.map((s) => (
          <div key={s.status} className="rounded-xl border border-slate-200 bg-white p-3.5">
            <StatusBadge colors={REQUEST_STATUS[s.status]} />
            <div className="text-2xl font-bold text-slate-900 mt-2">{s.count}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Requests Submitted Over Time" description="Last 90 days">
            {trend.every((p) => p.value === 0) ? (
              <EmptyState title="No requests yet" description="Requests submitted through the site will appear here." />
            ) : (
              <Chart data={trend} type="bar" height={200} color="#8B5CF6" />
            )}
          </Panel>
        </div>
        <Panel title="Total Requests" description="All-time">
          <div className="text-4xl font-bold text-slate-900">{mapped.length}</div>
          <p className="text-xs text-slate-500 mt-2">Requests across feature, bug, and general feedback.</p>
        </Panel>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 max-w-sm">
          <SearchBar param="q" placeholder="Search requests…" initialValue={q} />
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            param="status"
            label="Filter status"
            defaultValue="all"
            options={[
              { value: "all", label: "All statuses" },
              ...REQUEST_STATUS_ORDER.map((s) => ({
                value: s,
                label: REQUEST_STATUS[s].label,
                dot: REQUEST_STATUS[s].dot,
              })),
            ]}
          />
          <FilterSelect
            param="sort"
            label="Sort requests"
            defaultValue="newest"
            options={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "status", label: "By status" },
            ]}
          />
        </div>
      </div>

      <Panel bodyClassName="p-0">
        {pageRows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No requests found"
              description="Try adjusting your search or status filter."
            />
          </div>
        ) : (
          <DataTable columns={columns} rows={pageRows} rowKey={(r) => r.id} />
        )}
        {pageRows.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100">
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
          </div>
        )}
      </Panel>
    </div>
  );
}
