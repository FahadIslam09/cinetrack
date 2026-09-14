import { Skeleton, TableSkeleton } from "@/components/admin/skeleton";

export default function ReviewsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <Skeleton className="h-7 w-28 mb-1.5" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-full sm:w-72 rounded-lg" />
      </div>

      <TableSkeleton rows={8} />
    </div>
  );
}
