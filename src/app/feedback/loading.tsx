import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";

export default function FeedbackLoading() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] text-[#F5F7FA] select-none">
      <AppHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20 md:pb-12">
        {/* Back link skeleton */}
        <div className="mb-6">
          <div className="w-32 h-4 rounded bg-white/[0.05] skeleton-shimmer" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-8 space-y-3">
          <div className="w-28 h-6 rounded-full bg-white/[0.05] skeleton-shimmer" />
          <div className="w-3/4 max-w-md h-10 rounded-xl bg-white/[0.08] skeleton-shimmer" />
          <div className="w-full max-w-xl h-5 rounded bg-white/[0.04] skeleton-shimmer" />
        </div>

        {/* Form Skeleton */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#151C27] border border-white/[0.08] space-y-6">
          {/* Categories */}
          <div className="space-y-2.5">
            <div className="w-36 h-4 rounded bg-white/[0.06]" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-[#0F141D]/60 border border-white/[0.06] skeleton-shimmer"
                />
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <div className="w-24 h-4 rounded bg-white/[0.06]" />
            <div className="h-11 rounded-xl bg-[#0F141D] border border-white/[0.08] skeleton-shimmer" />
          </div>

          {/* Details Textarea */}
          <div className="space-y-2">
            <div className="w-20 h-4 rounded bg-white/[0.06]" />
            <div className="h-32 rounded-xl bg-[#0F141D] border border-white/[0.08] skeleton-shimmer" />
          </div>

          {/* Optional Email */}
          <div className="space-y-2">
            <div className="w-28 h-4 rounded bg-white/[0.06]" />
            <div className="h-11 rounded-xl bg-[#0F141D] border border-white/[0.08] skeleton-shimmer" />
          </div>

          {/* Bottom Bar */}
          <div className="pt-2 flex items-center justify-between">
            <div className="w-48 h-4 rounded bg-white/[0.04]" />
            <div className="w-36 h-11 rounded-xl bg-[#3B9EFF]/30 border border-[#3B9EFF]/40 skeleton-shimmer" />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
