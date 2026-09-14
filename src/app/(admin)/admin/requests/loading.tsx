import { Skeleton, ChartSkeleton, TableSkeleton } from "@/components/admin/skeleton";

export default function RequestsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <Skeleton className="h-7 w-44 mb-1.5" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* 6 status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-6 w-8" />
          </div>
        ))}
      </div>

      <ChartSkeleton />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Skeleton className="h-9 w-full sm:w-64 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg sm:ml-auto" />
      </div>

      <TableSkeleton rows={6} />
    </div>
  );
}
