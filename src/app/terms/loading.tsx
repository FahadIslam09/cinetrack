import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";

export default function TermsLoading() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] text-[#F5F7FA] select-none">
      <AppHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20 md:pb-12">
        {/* Header Skeleton */}
        <div className="mb-10 space-y-3">
          <div className="w-24 h-6 rounded-full bg-white/[0.05] skeleton-shimmer" />
          <div className="w-64 h-10 rounded-xl bg-white/[0.08] skeleton-shimmer" />
          <div className="w-32 h-3.5 rounded bg-white/[0.04] skeleton-shimmer" />
        </div>

        {/* 5 Legal Section Skeletons */}
        <div className="space-y-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-48 h-5 rounded bg-white/[0.08] skeleton-shimmer" />
              <div className="space-y-1.5">
                <div className="w-full h-4 rounded bg-white/[0.04] skeleton-shimmer" />
                <div className="w-11/12 h-4 rounded bg-white/[0.04] skeleton-shimmer" />
                <div className="w-4/5 h-4 rounded bg-white/[0.04] skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
