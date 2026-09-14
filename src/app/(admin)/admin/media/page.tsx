import Link from "next/link";
import { db } from "@/lib/db";
import { mediaItems, userMediaLogs } from "@/lib/db/schema";
import { ilike, count, sql } from "drizzle-orm";
import { PageHeader, Panel } from "@/components/admin/panel";
import { DataTable, type Column } from "@/components/admin/data-table";
import { SearchBar, FilterSelect } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { Film } from "lucide-react";

const PAGE_SIZE = 20;

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  movie: { label: "Movie", className: "bg-sky-50 text-sky-700 border-sky-200" },
  series: { label: "Series", className: "bg-violet-50 text-violet-700 border-violet-200" },
  anime: { label: "Anime", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

type MediaRow = {
  id: string;
  title: string;
  posterPath: string | null;
  mediaType: string;
  sourceId: string;
  createdAt: Date;
  tracked: number;
  rated: number;
  reviewed: number;
};

interface Props {
  searchParams: Promise<{ q?: string; type?: string; sort?: string; page?: string }>;
}

export default async function AdminMedia({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const type = params.type || "all";
  const sort = params.sort || "tracked";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const countRows = await db
    .select({
      mediaId: userMediaLogs.mediaId,
      tracked: count(userMediaLogs.id),
      rated: count(userMediaLogs.rating),
      reviewed: sql<number>`count(case when ${userMediaLogs.reviewText} is not null and trim(${userMediaLogs.reviewText}) != '' then 1 end)`,
    })
    .from(userMediaLogs)
    .groupBy(userMediaLogs.mediaId);

  const counts = new Map<string, { tracked: number; rated: number; reviewed: number }>();
  for (const c of countRows) {
    counts.set(c.mediaId, {
      tracked: Number(c.tracked),
      rated: Number(c.rated),
      reviewed: Number(c.reviewed),
    });
  }

  const rows = await db
    .select()
    .from(mediaItems)
    .where(q ? ilike(mediaItems.title, `%${q}%`) : undefined);

  const mapped: MediaRow[] = rows
    .filter((m) => type === "all" || m.mediaType === type)
    .map((m) => {
      const c = counts.get(m.id) || { tracked: 0, rated: 0, reviewed: 0 };
      return {
        id: m.id,
        title: m.title,
        posterPath: m.posterPath,
        mediaType: m.mediaType,
        sourceId: m.sourceId,
        createdAt: m.createdAt,
        tracked: c.tracked,
        rated: c.rated,
        reviewed: c.reviewed,
      };
    });

  mapped.sort((a, b) => {
    if (sort === "newest") return b.createdAt.getTime() - a.createdAt.getTime();
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "rated") return b.rated - a.rated;
    return b.tracked - a.tracked;
  });

  const total = mapped.length;
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = mapped.slice(start, start + PAGE_SIZE);

  const columns: Column<MediaRow>[] = [
    {
      key: "media",
      header: "Title",
      primary: true,
      render: (m) => (
        <Link
          href={`/${m.mediaType}/${m.sourceId}`}
          className="flex items-center gap-3 min-w-0 group"
        >
          <div className="w-9 h-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {m.posterPath ? (
              <img src={m.posterPath} alt={m.title} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Film className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 truncate">
              {m.title}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{m.id}</div>
          </div>
        </Link>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (m) => {
        const t = TYPE_BADGE[m.mediaType];
        return (
          <span className={`text-[11px] font-medium border rounded-full px-2 py-0.5 ${t?.className || "bg-slate-50 text-slate-600 border-slate-200"}`}>
            {t?.label || m.mediaType}
          </span>
        );
      },
    },
    {
      key: "added",
      header: "Added",
      render: (m) => <span className="text-xs text-slate-500">{m.createdAt.toLocaleDateString()}</span>,
    },
    {
      key: "tracked",
      header: "Tracked",
      render: (m) => <span className="text-sm font-semibold text-slate-700">{m.tracked}</span>,
    },
    {
      key: "rated",
      header: "Rated",
      render: (m) => <span className="text-sm text-slate-500">{m.rated}</span>,
    },
    {
      key: "reviewed",
      header: "Reviews",
      render: (m) => <span className="text-sm text-slate-500">{m.reviewed}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Media"
        description="Browse the media catalog, its tracking counts, and popularity."
      />

      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="flex-1 max-w-sm">
          <SearchBar param="q" placeholder="Search media…" initialValue={q} />
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            param="type"
            label="Media type"
            defaultValue="all"
            options={[
              { value: "all", label: "All types" },
              { value: "movie", label: "Movies" },
              { value: "series", label: "Series" },
              { value: "anime", label: "Anime" },
            ]}
          />
          <FilterSelect
            param="sort"
            label="Sort media"
            defaultValue="tracked"
            options={[
              { value: "tracked", label: "Most tracked" },
              { value: "rated", label: "Most rated" },
              { value: "newest", label: "Newest added" },
              { value: "title", label: "Title A–Z" },
            ]}
          />
        </div>
      </div>

      <Panel bodyClassName="p-0">
        {pageRows.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No media found"
              description="Try adjusting your search or type filter."
            />
          </div>
        ) : (
          <DataTable columns={columns} rows={pageRows} rowKey={(m) => m.id} />
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
