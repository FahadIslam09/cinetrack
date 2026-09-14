import Link from "next/link";
import { db } from "@/lib/db";
import { profiles, userMediaLogs } from "@/lib/db/schema";
import { or, ilike, count, sql } from "drizzle-orm";
import { PageHeader, Panel } from "@/components/admin/panel";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { ACCOUNT_STATUS } from "@/components/admin/theme";
import { SearchBar, FilterSelect } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { daysAgo } from "@/lib/admin/queries";

const PAGE_SIZE = 20;

type UserRow = {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  createdAt: Date;
  library: number;
  reviews: number;
  ratings: number;
};

interface Props {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AdminUsers({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const filter = params.filter || "all";
  const sort = params.sort || "newest";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  // Aggregate per-user metrics in SQL (avoids fetching all log rows + review text into memory)
  const activityRows = await db
    .select({
      userId: userMediaLogs.userId,
      library: count(userMediaLogs.id),
      reviews: sql<number>`count(case when ${userMediaLogs.reviewText} is not null and trim(${userMediaLogs.reviewText}) != '' then 1 end)`,
      ratings: count(userMediaLogs.rating),
    })
    .from(userMediaLogs)
    .groupBy(userMediaLogs.userId);

  const activity = new Map<string, { library: number; reviews: number; ratings: number }>();
  for (const r of activityRows) {
    activity.set(r.userId, {
      library: Number(r.library),
      reviews: Number(r.reviews),
      ratings: Number(r.ratings),
    });
  }

  // ponytail: fetch-all + JS sort/filter is fine at this scale; move to SQL
  // LIMIT/OFFSET + aggregation when the user base grows into the thousands.
  const rows = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      role: profiles.role,
      status: profiles.status,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(
      q
        ? or(ilike(profiles.username, `%${q}%`), ilike(profiles.fullName, `%${q}%`))
        : undefined
    );

  const mapped: UserRow[] = rows.map((r) => {
    const a = activity.get(r.id) || { library: 0, reviews: 0, ratings: 0 };
    return {
      id: r.id,
      username: r.username,
      fullName: r.fullName,
      avatarUrl: r.avatarUrl,
      role: r.role,
      status: r.status,
      createdAt: r.createdAt,
      library: a.library,
      reviews: a.reviews,
      ratings: a.ratings,
    };
  });

  const filtered = mapped.filter((u) => {
    switch (filter) {
      case "suspended":
        return u.status === "suspended";
      case "admin":
        return u.role === "admin";
      case "new":
        return u.createdAt.getTime() >= daysAgo(7).getTime();
      case "active":
        return u.status === "active" && u.library > 0;
      case "inactive":
        return u.status === "active" && u.library === 0;
      default:
        return true;
    }
  });

  filtered.sort((a, b) => {
    switch (sort) {
      case "oldest":
        return a.createdAt.getTime() - b.createdAt.getTime();
      case "name":
        return a.username.localeCompare(b.username);
      case "activity":
        return b.library - a.library;
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const columns: Column<UserRow>[] = [
    {
      key: "user",
      header: "User",
      primary: true,
      render: (u) => (
        <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 min-w-0 group">
          {u.avatarUrl ? (
            <img
              src={u.avatarUrl}
              alt={u.username}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold shrink-0">
              {(u.fullName || u.username).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">
              {u.fullName || u.username}
            </div>
            <div className="text-xs text-slate-400 truncate">@{u.username}</div>
          </div>
        </Link>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (u) => (
        <span className="text-xs text-slate-500">{u.createdAt.toLocaleDateString()}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <StatusBadge
          colors={ACCOUNT_STATUS[u.status as "active" | "suspended"] || ACCOUNT_STATUS.active}
        />
      ),
    },
    {
      key: "library",
      header: "Library",
      render: (u) => <span className="text-sm font-medium text-slate-700">{u.library}</span>,
    },
    {
      key: "reviews",
      header: "Reviews",
      render: (u) => <span className="text-sm text-slate-500">{u.reviews}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (u) =>
        u.role === "admin" ? (
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
            Admin
          </span>
        ) : (
          <span className="text-xs text-slate-400">Member</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Search, filter, and manage user accounts."
      />

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 max-w-sm">
          <SearchBar param="q" placeholder="Search by name or username…" initialValue={q} />
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            param="filter"
            label="Filter users"
            defaultValue="all"
            options={[
              { value: "all", label: "All users" },
              { value: "new", label: "New (7d)", dot: "bg-blue-500" },
              { value: "active", label: "Active", dot: "bg-emerald-500" },
              { value: "inactive", label: "Inactive", dot: "bg-slate-400" },
              { value: "suspended", label: "Suspended", dot: "bg-rose-500" },
              { value: "admin", label: "Admins", dot: "bg-violet-500" },
            ]}
          />
          <FilterSelect
            param="sort"
            label="Sort users"
            defaultValue="newest"
            options={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "name", label: "Name A–Z" },
              { value: "activity", label: "Most active" },
            ]}
          />
        </div>
      </div>

      <Panel bodyClassName="p-0">
        <DataTable columns={columns} rows={pageRows} rowKey={(u) => u.id} />
        {pageRows.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100">
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
          </div>
        )}
      </Panel>
    </div>
  );
}
