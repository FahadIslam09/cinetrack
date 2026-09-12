import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";

export default function DiscoverLoading() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-12 select-none">
      <AppHeader />

      <main className="flex-1 max-w-[834px] lg:max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 pt-20 sm:pt-24 flex flex-col gap-6">
        {/* Header Title & Subtitle Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-8 sm:h-10 w-48 rounded-xl bg-white/[0.08] skeleton-shimmer" />
          <div className="h-4 w-80 max-w-full rounded bg-white/[0.04] skeleton-shimmer" />
        </div>

        {/* Filter Bar Console Skeleton */}
        <div className="w-full rounded-2xl bg-gradient-to-b from-[#141B26]/80 to-[#0A0E17]/90 border border-white/[0.06] p-2.5 sm:p-3 flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Media Tabs Skeleton */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080C14]/90 border border-white/[0.04] w-fit">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-7 w-20 rounded-lg bg-white/[0.05] skeleton-shimmer" />
              ))}
            </div>

            {/* Dropdowns Skeleton */}
            <div className="grid grid-cols-3 lg:flex lg:items-center gap-2">
              <div className="h-9 w-full lg:w-40 rounded-xl bg-white/[0.05] skeleton-shimmer" />
              <div className="h-9 w-full lg:w-36 rounded-xl bg-white/[0.05] skeleton-shimmer" />
              <div className="h-9 w-full lg:w-36 rounded-xl bg-white/[0.05] skeleton-shimmer" />
            </div>
          </div>
        </div>

        {/* Categories & Media Cards Skeletons */}
        <div className="flex flex-col gap-9 mt-1">
          {[...Array(2)].map((_, catIdx) => (
            <section key={catIdx} className="flex flex-col gap-3.5">
              {/* Category Header Skeleton */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] skeleton-shimmer" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-5 w-32 rounded bg-white/[0.08] skeleton-shimmer" />
                    <div className="h-3 w-48 rounded bg-white/[0.04] skeleton-shimmer" />
                  </div>
                </div>
              </div>

              {/* Media Cards Grid Skeletons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col rounded-[14px] bg-[#121824] border border-white/[0.06] overflow-hidden skeleton-shimmer"
                  >
                    <div className="w-full aspect-[2/3] bg-[#161E2C] relative">
                      <div className="absolute top-2 left-2 w-16 h-5 rounded-full bg-white/[0.08]" />
                      <div className="absolute top-2 right-2 w-10 h-5 rounded-full bg-white/[0.08]" />
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="h-4 w-3/4 rounded bg-white/[0.08]" />
                      <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
