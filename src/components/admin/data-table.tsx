import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";

export interface Column<T> {
  key: string;
  header: string;
  primary?: boolean;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: React.ReactNode;
}

export function DataTable<T>({ columns, rows, rowKey, empty }: DataTableProps<T>) {
  if (rows.length === 0) {
    return empty ?? <EmptyState title="No results" description="Nothing to show here yet." />;
  }

  const primaryCol = columns.find((c) => c.primary) || columns[0];
  const metaCols = columns.filter((c) => c !== primaryCol);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={cn(
                      "text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 px-4 py-3",
                      c.className
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3 align-middle", c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2.5">
        {rows.map((row) => (
          <div
            key={rowKey(row)}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              {primaryCol.render(row)}
            </div>
            {metaCols.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
                {metaCols.map((c) => (
                  <div key={c.key} className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {c.header}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-700">{c.render(row)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
