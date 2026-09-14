import { Skeleton, TableSkeleton } from "@/components/admin/skeleton";

export default function MediaLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-28 mb-1.5" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Skeleton className="h-9 w-full sm:w-64 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg sm:ml-auto" />
      </div>

      <TableSkeleton rows={8} />
    </div>
  );
}
