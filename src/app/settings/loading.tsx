export default function SettingsLoading() {
  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-white/[0.08] skeleton-shimmer" />
          <div className="h-4 w-72 max-w-full rounded bg-white/[0.04] skeleton-shimmer" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-white/[0.06] skeleton-shimmer shrink-0" />
      </div>

      {/* Identity Card Skeleton */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#151C27] border border-white/[0.08] p-5 sm:p-7 shadow-sm space-y-6">
        {/* Cover Preview + Avatar */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0F141D] border border-white/[0.06] h-32 sm:h-40 skeleton-shimmer" />

        {/* Avatar + Name row */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/[0.08] skeleton-shimmer shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-40 rounded bg-white/[0.08] skeleton-shimmer" />
            <div className="h-4 w-28 rounded bg-white/[0.04] skeleton-shimmer" />
          </div>
        </div>

        {/* Fields list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <div className="h-3.5 w-24 rounded bg-white/[0.05] skeleton-shimmer" />
            <div className="h-5 w-36 rounded bg-white/[0.08] skeleton-shimmer" />
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <div className="h-3.5 w-20 rounded bg-white/[0.05] skeleton-shimmer" />
            <div className="h-5 w-32 rounded bg-white/[0.08] skeleton-shimmer" />
          </div>
        </div>

        {/* Bio block */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
          <div className="h-3.5 w-16 rounded bg-white/[0.05] skeleton-shimmer" />
          <div className="h-4 w-full rounded bg-white/[0.04] skeleton-shimmer" />
          <div className="h-4 w-3/4 rounded bg-white/[0.04] skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
