import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";

export default function ContactLoading() {
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] text-[#F5F7FA] select-none">
      <AppHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20 md:pb-12">
        {/* Header Skeleton */}
        <div className="mb-10 space-y-3">
          <div className="w-24 h-6 rounded-full bg-white/[0.05] skeleton-shimmer" />
          <div className="w-3/4 max-w-md h-10 rounded-xl bg-white/[0.08] skeleton-shimmer" />
          <div className="w-full max-w-xl h-5 rounded bg-white/[0.04] skeleton-shimmer" />
        </div>

        {/* 2 Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="p-6 rounded-2xl bg-[#151C27] border border-white/[0.06] space-y-4 skeleton-shimmer">
            <div className="w-9 h-9 rounded-xl bg-white/[0.08]" />
            <div className="w-32 h-5 rounded bg-white/[0.08]" />
            <div className="w-full h-4 rounded bg-white/[0.04]" />
            <div className="w-40 h-4 rounded bg-white/[0.06] mt-4" />
          </div>

          <div className="p-6 rounded-2xl bg-[#151C27] border border-white/[0.06] space-y-4 skeleton-shimmer">
            <div className="w-9 h-9 rounded-xl bg-white/[0.08]" />
            <div className="w-36 h-5 rounded bg-white/[0.08]" />
            <div className="w-full h-4 rounded bg-white/[0.04]" />
            <div className="w-44 h-4 rounded bg-white/[0.06] mt-4" />
          </div>
        </div>

        {/* Note skeleton */}
        <div className="p-6 rounded-2xl bg-[#151C27]/50 border border-white/[0.06] space-y-2 skeleton-shimmer">
          <div className="w-28 h-4 rounded bg-white/[0.08]" />
          <div className="w-full h-4 rounded bg-white/[0.04]" />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
