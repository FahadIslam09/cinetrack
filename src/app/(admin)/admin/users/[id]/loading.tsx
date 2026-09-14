import { Skeleton, ListSkeleton } from "@/components/admin/skeleton";

export default function UserDetailLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-36" />

      {/* Profile header card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* 8 Metric stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Activity list */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <Skeleton className="h-4 w-32 mb-4" />
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}
