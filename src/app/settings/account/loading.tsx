export default function AccountSettingsLoading() {
  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-52 rounded-lg bg-white/[0.08] skeleton-shimmer" />
        <div className="h-4 w-80 max-w-full rounded bg-white/[0.04] skeleton-shimmer" />
      </div>

      {/* 1. Email Card Skeleton */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#151C27] border border-white/[0.08] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 shrink-0 skeleton-shimmer" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-28 rounded bg-white/[0.08] skeleton-shimmer" />
                <div className="h-4 w-16 rounded-full bg-emerald-500/10 skeleton-shimmer" />
              </div>
              <div className="h-4 w-48 rounded bg-white/[0.06] skeleton-shimmer" />
              <div className="h-3 w-64 max-w-full rounded bg-white/[0.04] skeleton-shimmer" />
            </div>
          </div>
          <div className="h-10 w-32 rounded-xl bg-white/[0.05] border border-white/[0.08] skeleton-shimmer shrink-0" />
        </div>
      </div>

      {/* 2. Password Card Skeleton */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#151C27] border border-white/[0.08] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 shrink-0 skeleton-shimmer" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 rounded bg-white/[0.08] skeleton-shimmer" />
                <div className="h-4 w-20 rounded-full bg-white/[0.05] skeleton-shimmer" />
              </div>
              <div className="h-4 w-32 rounded bg-white/[0.06] skeleton-shimmer" />
              <div className="h-3 w-72 max-w-full rounded bg-white/[0.04] skeleton-shimmer" />
            </div>
          </div>
          <div className="h-10 w-36 rounded-xl bg-white/[0.05] border border-white/[0.08] skeleton-shimmer shrink-0" />
        </div>
      </div>

      {/* 3. Sign-in Method Card Skeleton */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#151C27] border border-white/[0.08] p-5 sm:p-7 shadow-sm space-y-4">
        <div className="space-y-1.5">
          <div className="h-4 w-36 rounded bg-white/[0.08] skeleton-shimmer" />
          <div className="h-3 w-64 max-w-full rounded bg-white/[0.04] skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] skeleton-shimmer shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-24 rounded bg-white/[0.08] skeleton-shimmer" />
              <div className="h-3 w-32 rounded bg-white/[0.04] skeleton-shimmer" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] skeleton-shimmer shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-20 rounded bg-white/[0.08] skeleton-shimmer" />
              <div className="h-3 w-28 rounded bg-white/[0.04] skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
