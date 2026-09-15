import Link from "next/link";
import { PageHeader, Panel } from "@/components/admin/panel";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { ACCOUNT_STATUS } from "@/components/admin/theme";
import { SearchBar, FilterSelect } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { getPaginatedUsers, type AdminUserListItem } from "@/lib/admin/queries";
import { getAdminProfile } from "@/lib/admin/auth";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { Mail, ShieldCheck } from "lucide-react";

const PAGE_SIZE = 20;

function formatLastActive(date: Date | null): string {
  if (!date) return "Never";
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function formatProvider(provider: string | null): { label: string; className: string } {
  const p = (provider || "email").toLowerCase();
  if (p.includes("google")) {
    return { label: "Google", className: "bg-blue-50 text-blue-700 border-blue-200" };
  }
  if (p.includes("github")) {
    return { label: "GitHub", className: "bg-slate-100 text-slate-700 border-slate-300" };
  }
  return { label: "Email", className: "bg-slate-50 text-slate-600 border-slate-200" };
}

interface Props {
  searchParams: Promise<{
    q?: string;
    status?: string;
    role?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AdminUsers({ searchParams }: Props) {
  const currentAdmin = await getAdminProfile();
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status || "all";
  const role = params.role || "all";
  const sort = params.sort || "newest";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const { users, total } = await getPaginatedUsers({
    q,
    status,
    role,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  const columns: Column<AdminUserListItem>[] = [
    {
      key: "user",
      header: "User",
      primary: true,
      render: (u) => {
        const initials = (u.fullName || u.username).slice(0, 2).toUpperCase();
        return (
          <Link
            href={`/admin/users/${u.id}`}
            className="flex items-center gap-3 min-w-0 group cursor-pointer"
          >
            {u.avatarUrl ? (
              <img
                src={u.avatarUrl}
                alt={u.username}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                {u.fullName || u.username}
              </div>
              <div className="text-xs text-slate-400 truncate">@{u.username}</div>
            </div>
          </Link>
        );
      },
    },
    {
      key: "email",
      header: "Email",
      render: (u) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-[180px] truncate" title={u.email || "No email"}>
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{u.email || "—"}</span>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Sign-In",
      render: (u) => {
        const prov = formatProvider(u.provider);
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${prov.className}`}
          >
            {prov.label}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <div className="flex flex-col gap-0.5">
          <StatusBadge
            colors={ACCOUNT_STATUS[u.status] || ACCOUNT_STATUS.active}
          />
          {u.statusReason && (
            <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={u.statusReason}>
              {u.statusReason}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) =>
        u.role === "admin" ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        ) : (
          <span className="text-xs text-slate-500 font-medium">Member</span>
        ),
    },
    {
      key: "library",
      header: "Library",
      render: (u) => (
        <span className="text-sm font-semibold text-slate-800">{u.library}</span>
      ),
    },
    {
      key: "reviews",
      header: "Reviews",
      render: (u) => (
        <span className="text-sm text-slate-600">{u.reviews}</span>
      ),
    },
    {
      key: "lastActive",
      header: "Last Active",
      render: (u) => (
        <span className="text-xs text-slate-500 font-medium">
          {formatLastActive(u.lastSignInAt)}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (u) => (
        <span className="text-xs text-slate-500">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-24",
      render: (u) => (
        <UserRowActions
          userId={u.id}
          username={u.username}
          role={u.role}
          status={u.status}
          isCurrentAdmin={currentAdmin?.id === u.id}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Search, inspect, and manage CineTrack accounts and access."
      />

      <div className="flex flex-col lg:flex-row gap-2.5 items-start lg:items-center justify-between">
        <div className="w-full lg:max-w-md">
          <SearchBar
            param="q"
            placeholder="Search by name, username, or email…"
            initialValue={q}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <FilterSelect
            param="status"
            label="Status"
            defaultValue="all"
            options={[
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active", dot: "bg-emerald-500" },
              { value: "suspended", label: "Suspended", dot: "bg-amber-500" },
              { value: "banned", label: "Banned", dot: "bg-rose-500" },
            ]}
          />

          <FilterSelect
            param="role"
            label="Role"
            defaultValue="all"
            options={[
              { value: "all", label: "All Roles" },
              { value: "user", label: "Members", dot: "bg-slate-400" },
              { value: "admin", label: "Admins", dot: "bg-blue-500" },
            ]}
          />

          <FilterSelect
            param="sort"
            label="Sort"
            defaultValue="newest"
            options={[
              { value: "newest", label: "Newest Joined" },
              { value: "oldest", label: "Oldest Joined" },
              { value: "name", label: "Name A–Z" },
              { value: "activity", label: "Most Active Library" },
              { value: "reviews", label: "Most Reviews" },
            ]}
          />
        </div>
      </div>

      <Panel bodyClassName="p-0">
        <DataTable
          columns={columns}
          rows={users}
          rowKey={(u) => u.id}
          empty={
            <EmptyState
              title="No users found"
              description={
                q || status !== "all" || role !== "all"
                  ? "No accounts match your active search or filter criteria."
                  : "No registered users in the database."
              }
            />
          }
        />
        {total > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-800">{users.length}</span> of{" "}
              <span className="font-semibold text-slate-800">{total}</span> total users
            </div>
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
          </div>
        )}
      </Panel>
    </div>
  );
}
