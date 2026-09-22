import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";

export default function ProfileLoading() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] select-none">
      <AppHeader />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3.5 sm:px-6 lg:px-12 pt-18 sm:pt-24 pb-24 md:pb-12">
        <div className="flex flex-col gap-6">
          {/* 1. Prestigious Vertical Profile Hero Card Skeleton */}
          <div className="rounded-3xl bg-[#151C27] border border-white/[0.08] shadow-2xl relative overflow-hidden flex flex-col">
            {/* Cover Backdrop Skeleton */}
            <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden bg-[#0F172A] skeleton-shimmer">
              <div className="absolute inset-0 bg-gradient-to-t from-[#151C27] via-[#151C27]/40 to-transparent pointer-events-none" />
              <div className="absolute top-3.5 right-3.5 h-7 w-24 rounded-full bg-black/40 border border-white/10" />
            </div>

            {/* Card Body: Centered Overlapping Avatar, Identity, Bio & Actions */}
            <div className="px-5 sm:px-8 pb-6 flex flex-col items-center text-center relative z-10">
              {/* Circular Overlapping Avatar */}
              <div className="relative -mt-14 sm:-mt-16 w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#151C27] sm:ring-[5px] bg-[#1A2332] shadow-2xl overflow-hidden skeleton-shimmer shrink-0" />

              {/* Display Name */}
              <div className="mt-3.5 h-7 sm:h-8 w-48 sm:w-60 rounded-lg bg-white/[0.08] skeleton-shimmer" />

              {/* Username Pill */}
              <div className="mt-2 h-6 w-28 rounded-full bg-[#1D2734]/80 border border-white/[0.08] skeleton-shimmer" />

              {/* Bio */}
              <div className="mt-3.5 h-4 w-64 sm:w-80 max-w-full rounded bg-white/[0.05] skeleton-shimmer" />

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2.5 mt-5">
                <div className="h-10 w-28 sm:w-32 rounded-full bg-[#1D2734] border border-white/[0.08] skeleton-shimmer" />
                <div className="h-10 w-32 sm:w-36 rounded-full bg-[#3B9EFF]/30 border border-[#3B9EFF]/40 skeleton-shimmer" />
              </div>

              {/* 3-Column Stats Bar with Vertical Dividers */}
              <div className="w-full mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-3 divide-x divide-white/[0.08] text-center">
                <div className="flex flex-col items-center justify-center px-2 gap-1.5">
                  <div className="h-6 w-12 rounded bg-white/[0.08] skeleton-shimmer" />
                  <div className="h-3 w-16 rounded bg-white/[0.04] skeleton-shimmer" />
                </div>
                <div className="flex flex-col items-center justify-center px-2 gap-1.5">
                  <div className="h-6 w-12 rounded bg-white/[0.08] skeleton-shimmer" />
                  <div className="h-3 w-20 rounded bg-white/[0.04] skeleton-shimmer" />
                </div>
                <div className="flex flex-col items-center justify-center px-2 gap-1.5">
                  <div className="h-6 w-16 rounded bg-white/[0.08] skeleton-shimmer" />
                  <div className="h-3 w-20 rounded bg-white/[0.04] skeleton-shimmer" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Key Metrics Bar Skeleton (4 columns matching exact stats) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Card 1: Movies */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#3B9EFF]/15 shrink-0 skeleton-shimmer" />
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="h-5 sm:h-6 w-10 rounded bg-white/[0.08] skeleton-shimmer" />
                <div className="h-3 w-20 rounded bg-white/[0.04] skeleton-shimmer" />
              </div>
            </div>

            {/* Card 2: Series & Anime */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#A855F7]/15 shrink-0 skeleton-shimmer" />
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="h-5 sm:h-6 w-10 rounded bg-white/[0.08] skeleton-shimmer" />
                <div className="h-3 w-22 rounded bg-white/[0.04] skeleton-shimmer" />
              </div>
            </div>

            {/* Card 3: Masterpieces */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F5C84B]/15 shrink-0 skeleton-shimmer" />
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="h-5 sm:h-6 w-10 rounded bg-[#F5C84B]/20 skeleton-shimmer" />
                <div className="h-3 w-20 rounded bg-white/[0.04] skeleton-shimmer" />
              </div>
            </div>

            {/* Card 4: Completion Rate */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#22C55E]/15 shrink-0 skeleton-shimmer" />
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <div className="h-5 sm:h-6 w-12 rounded bg-white/[0.08] skeleton-shimmer" />
                <div className="h-3 w-24 rounded bg-white/[0.04] skeleton-shimmer" />
              </div>
            </div>
          </div>

          {/* 3. Controls Bar Skeleton (Exact layout matching filter bar) */}
          <div className="relative flex flex-col gap-2.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
              {/* Row 1 on Mobile: Status Dropdown + Search Input Inline */}
              <div className="flex items-center gap-2 flex-1">
                <div className="h-9 w-[125px] sm:w-[140px] shrink-0 rounded-lg bg-[#151C27] border border-white/[0.08] skeleton-shimmer" />
                <div className="h-9 flex-1 rounded-lg bg-[#151C27] border border-white/[0.08] skeleton-shimmer" />
              </div>

              {/* 4 Filter Dropdowns */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2 w-full lg:w-auto shrink-0">
                <div className="h-9 w-full lg:w-[125px] rounded-lg bg-[#151C27] border border-white/[0.08] skeleton-shimmer" />
                <div className="h-9 w-full lg:w-[140px] rounded-lg bg-[#151C27] border border-white/[0.08] skeleton-shimmer" />
                <div className="h-9 w-full lg:w-[125px] rounded-lg bg-[#151C27] border border-white/[0.08] skeleton-shimmer" />
                <div className="h-9 w-full lg:w-[160px] rounded-lg bg-[#151C27] border border-white/[0.08] skeleton-shimmer" />
              </div>
            </div>
          </div>

          {/* 4. 12 Media Card Skeletons (Exact MediaCard structure) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-full flex flex-col rounded-[14px] bg-[#121824] border border-white/[0.08] overflow-hidden"
              >
                {/* Poster 2:3 with top-left badge and top-right rating pill */}
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-[#161E2C] skeleton-shimmer">
                  {/* Top-Left Status Pill */}
                  <div className="absolute top-2.5 left-2.5 h-5 w-16 rounded-full bg-black/60 border border-white/10" />
                  {/* Top-Right Pill */}
                  <div className="absolute top-2.5 right-2.5 h-5 w-10 rounded-full bg-black/60 border border-white/10" />
                  {/* Bottom Vignette */}
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#121824] via-[#121824]/40 to-transparent pointer-events-none" />
                </div>

                {/* Card Content Section */}
                <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 relative z-10 bg-[#121824]">
                  <div>
                    {/* Title */}
                    <div className="h-4 w-4/5 rounded bg-white/[0.08] skeleton-shimmer" />
                    {/* Subtitle / Year • Format */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="h-3 w-8 rounded bg-white/[0.05] skeleton-shimmer" />
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <div className="h-3 w-10 rounded bg-white/[0.05] skeleton-shimmer" />
                    </div>
                  </div>

                  {/* Bottom Row: Tag Badge & Right Genre */}
                  <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between gap-2">
                    <div className="h-4 w-16 rounded-md bg-white/[0.06] skeleton-shimmer" />
                    <div className="h-3 w-12 rounded bg-white/[0.04] skeleton-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 5. See More Pagination Button Skeleton */}
          <div className="flex justify-center pt-6 pb-2">
            <div className="h-8 sm:h-9 w-36 rounded-xl bg-[#141B26]/90 border border-white/[0.08] skeleton-shimmer" />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
