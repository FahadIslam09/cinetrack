import { Skeleton, StatCardSkeleton, ChartSkeleton } from "@/components/admin/skeleton";

export default function ActivityLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-48 mb-1.5" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-44 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <Skeleton className="h-4 w-36 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
