import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";

export default function MediaDetailsLoading() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] select-none">
      <AppHeader />

      <main className="flex-1 flex flex-col w-full pt-16 pb-24 md:pb-12">
        {/* Backdrop & Header Hero Skeleton */}
        <div className="relative w-full overflow-hidden bg-[#151C27] border-b border-white/[0.06]">
          {/* Back Button Skeleton */}
          <div className="absolute top-3.5 left-4 sm:top-5 sm:left-6 lg:left-8 z-20">
            <div className="w-16 h-7 rounded-full bg-[#0F141D]/80 border border-white/10 backdrop-blur-md skeleton-shimmer" />
          </div>

          {/* Backdrop Image Skeleton */}
          <div className="w-full h-80 sm:h-96 bg-[#182230] relative skeleton-shimmer">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-[#0F141D]/70 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F141D]/90 via-transparent to-[#0F141D]/40" />
          </div>

          {/* Overlapping Poster & Information Skeleton */}
          <div className="max-w-5xl mx-auto px-4 -mt-32 sm:-mt-40 relative z-10 pb-6 flex flex-col gap-4">
            <div className="flex items-end gap-3.5 sm:gap-5">
              {/* Poster 2:3 */}
              <div className="w-28 sm:w-40 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl bg-[#1D2734] border border-white/[0.1] relative skeleton-shimmer">
                <div className="w-full h-full bg-[#182230]" />
                <div className="absolute top-1.5 left-1.5 w-14 h-5 rounded bg-[#0F141D]/90 border border-white/[0.08]" />
              </div>

              {/* Title & Metadata Skeletons */}
              <div className="flex flex-col justify-end min-w-0 pb-1 flex-1">
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="w-12 h-5 rounded bg-[#3B9EFF]/20" />
                  <div className="w-10 h-4 rounded bg-white/[0.08] skeleton-shimmer" />
                  <span className="text-[#4B5563]">•</span>
                  <div className="w-16 h-4 rounded bg-white/[0.08] skeleton-shimmer" />
                  <span className="text-[#4B5563]">•</span>
                  <div className="w-24 h-4 rounded bg-white/[0.08] skeleton-shimmer" />
                </div>

                {/* Main Title Skeleton */}
                <div className="h-7 sm:h-9 w-3/4 max-w-md rounded-lg bg-white/[0.10] skeleton-shimmer mb-2" />
                {/* Subtitle / Original title */}
                <div className="h-3.5 w-1/3 max-w-xs rounded bg-white/[0.05] skeleton-shimmer" />
              </div>
            </div>

            {/* Ratings & Action Bar Skeleton */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {/* Rating pill placeholders */}
              <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
                <div className="w-24 h-8 rounded-lg bg-[#151C27] border border-white/[0.06] skeleton-shimmer" />
                <div className="w-28 h-8 rounded-lg bg-[#151C27] border border-white/[0.06] skeleton-shimmer" />
              </div>

              {/* Action Buttons Placeholder */}
              <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
                <div className="flex-1 sm:w-36 h-10 rounded-xl bg-white/[0.08] border border-white/[0.08] skeleton-shimmer" />
                <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.08] skeleton-shimmer shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Body Skeletons */}
        <div className="max-w-5xl mx-auto px-4 w-full py-6 flex flex-col gap-6">
          {/* Where to Watch Section Skeleton */}
          <section className="p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-28 h-4 rounded bg-white/[0.08] skeleton-shimmer" />
              <div className="w-28 h-3 rounded bg-white/[0.04] skeleton-shimmer" />
            </div>

            <div className="flex items-center gap-3 overflow-hidden py-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1D2734] border border-white/[0.06] w-32 h-10 shrink-0 skeleton-shimmer"
                >
                  <div className="w-6 h-6 rounded bg-white/[0.08] shrink-0" />
                  <div className="w-16 h-3 rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          </section>

          {/* Overview / Synopsis Skeleton */}
          <section className="flex flex-col gap-2.5">
            <div className="w-20 h-4 rounded bg-white/[0.08] skeleton-shimmer mb-1" />
            <div className="flex flex-col gap-2">
              <div className="w-full h-3.5 rounded bg-white/[0.05] skeleton-shimmer" />
              <div className="w-11/12 h-3.5 rounded bg-white/[0.05] skeleton-shimmer" />
              <div className="w-4/5 h-3.5 rounded bg-white/[0.05] skeleton-shimmer" />
            </div>
          </section>

          {/* Principal Cast Skeleton */}
          <section className="flex flex-col gap-3">
            <div className="w-28 h-4 rounded bg-white/[0.08] skeleton-shimmer" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[...Array(6)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-[#151C27] border border-white/[0.04] gap-2 skeleton-shimmer"
                >
                  <div className="w-14 h-14 rounded-full bg-white/[0.08] ring-1 ring-white/10" />
                  <div className="w-16 h-3 rounded bg-white/[0.08]" />
                  <div className="w-12 h-2.5 rounded bg-white/[0.04]" />
                </div>
              ))}
            </div>
          </section>

          {/* Member Dispatches Skeleton */}
          <section className="flex flex-col gap-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="w-36 h-4 rounded bg-white/[0.08] skeleton-shimmer" />
              <div className="w-16 h-3.5 rounded bg-white/[0.06] skeleton-shimmer" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(2)].map((_, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-4 sm:p-5 rounded-xl bg-[#1D2734] border border-white/[0.06] gap-3.5 shadow-sm skeleton-shimmer"
                >
                  <div>
                    {/* Critic Header Skeleton */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-full bg-white/[0.08] ring-1 ring-white/10 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-28 h-4 rounded bg-white/[0.08]" />
                          <div className="w-16 h-4 rounded bg-white/[0.06]" />
                        </div>
                        <div className="w-32 h-3 rounded bg-white/[0.04] mt-1.5" />
                      </div>
                    </div>

                    {/* Review Body Text Skeleton */}
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="w-full h-3 rounded bg-white/[0.05]" />
                      <div className="w-11/12 h-3 rounded bg-white/[0.05]" />
                      <div className="w-4/5 h-3 rounded bg-white/[0.05]" />
                    </div>
                  </div>

                  {/* Footer Controls Skeleton */}
                  <div className="pt-3 mt-auto border-t border-white/[0.06] flex items-center justify-between">
                    <div className="w-16 h-3 rounded bg-white/[0.04]" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-3 rounded bg-white/[0.04]" />
                      <div className="w-10 h-3 rounded bg-white/[0.04]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Similar Recommendations Skeleton */}
          <section className="flex flex-col gap-3 mt-2">
            <div className="w-32 h-4 rounded bg-white/[0.08] skeleton-shimmer" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[2/3] rounded-[14px] bg-[#121824] border border-white/[0.06] overflow-hidden relative skeleton-shimmer"
                >
                  <div className="w-full h-full bg-white/[0.02]" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#121824] to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1.5">
                    <div className="w-3/4 h-3.5 rounded bg-white/[0.08]" />
                    <div className="w-1/2 h-2.5 rounded bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
