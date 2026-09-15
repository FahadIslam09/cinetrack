import Link from "next/link";
import { db } from "@/lib/db";
import { userMediaLogs, mediaItems, profiles } from "@/lib/db/schema";
import { isNotNull, or, ilike, desc, count, eq, and } from "drizzle-orm";
import { PageHeader, Panel } from "@/components/admin/panel";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SearchBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";

const PAGE_SIZE = 20;

const RATING_BADGE: Record<string, string> = {
  masterpiece: "bg-yellow-50 text-yellow-700 border-yellow-200",
  great: "bg-emerald-50 text-emerald-700 border-emerald-200",
  good: "bg-blue-50 text-blue-700 border-blue-200",
  average: "bg-amber-50 text-amber-700 border-amber-200",
  poor: "bg-rose-50 text-rose-700 border-rose-200",
};

type ReviewRow = {
  id: string;
  reviewText: string | null;
  rating: string | null;
  containsSpoilers: boolean;
  updatedAt: Date;
  mediaTitle: string;
  username: string | null;
};

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminReviews({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const searchWhere = q
    ? or(
        ilike(userMediaLogs.reviewText, `%${q}%`),
        ilike(mediaItems.title, `%${q}%`),
        ilike(profiles.username, `%${q}%`)
      )
    : undefined;

  const where = searchWhere
    ? and(isNotNull(userMediaLogs.reviewText), searchWhere)
    : isNotNull(userMediaLogs.reviewText);

  const [[totalRow], rows] = await Promise.all([
    db
      .select({ n: count(userMediaLogs.id) })
      .from(userMediaLogs)
      .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
      .leftJoin(profiles, eq(userMediaLogs.userId, profiles.id))
      .where(where),
    db
      .select({
        id: userMediaLogs.id,
        reviewText: userMediaLogs.reviewText,
        rating: userMediaLogs.rating,
        containsSpoilers: userMediaLogs.containsSpoilers,
        updatedAt: userMediaLogs.updatedAt,
        mediaTitle: mediaItems.title,
        username: profiles.username,
      })
      .from(userMediaLogs)
      .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
      .leftJoin(profiles, eq(userMediaLogs.userId, profiles.id))
      .where(where)
      .orderBy(desc(userMediaLogs.updatedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
  ]);

  const total = totalRow?.n ?? 0;

  const columns: Column<ReviewRow>[] = [
    {
      key: "review",
      header: "Review",
      primary: true,
      render: (r) => (
        <div className="min-w-0 max-w-md">
          <p className="text-sm text-slate-700 leading-snug line-clamp-2">
            {r.containsSpoilers && (
              <span className="mr-1.5 text-[10px] font-semibold uppercase text-amber-600">Spoilers</span>
            )}
            {r.reviewText}
          </p>
          <p className="text-xs text-slate-400 mt-1 truncate">on {r.mediaTitle}</p>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (r) =>
        r.rating ? (
          <span className={`text-[11px] font-semibold capitalize border rounded-full px-2 py-0.5 ${RATING_BADGE[r.rating] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
            {r.rating}
          </span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        ),
    },
    {
      key: "author",
      header: "Author",
      render: (r) => (
        <Link href={`/${r.username}`} className="text-xs font-medium text-slate-600 hover:text-blue-600">
          @{r.username || "user"}
        </Link>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (r) => <span className="text-xs text-slate-500">{r.updatedAt.toLocaleDateString()}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Reviews" description="Browse, search, and review user-submitted reviews." />

      <div className="max-w-sm">
        <SearchBar param="q" placeholder="Search reviews, media, or users…" initialValue={q} />
      </div>

      <Panel bodyClassName="p-0">
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No reviews found" description="Try adjusting your search." />
          </div>
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
        )}
        {rows.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100">
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
          </div>
        )}
      </Panel>
    </div>
  );
}
