import { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
import { createClient } from "@/lib/supabase/server";
import { Film, Compass, Shield, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About · CineTrack",
  description:
    "CineTrack is a disciplined cinema intelligence and cataloging platform designed for film lovers, TV trackers, and anime enthusiasts.",
};

export default async function AboutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] text-[#F5F7FA]">
      <AppHeader
        user={
          user
            ? {
                email: user.email,
                avatarUrl: user.user_metadata?.avatar_url,
                username: user.user_metadata?.user_name,
              }
            : null
        }
      />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20 md:pb-12">
        {/* Header section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-[#3B9EFF] tracking-wider uppercase mb-4">
            About CineTrack
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA] leading-tight">
            Crafted for thoughtful cinema tracking.
          </h1>
          <p className="text-base text-[#A8B0BD] mt-3 leading-relaxed">
            A focused, distraction-free environment built to log what you watch,
            curate your library, and explore cinema without noise.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="p-5 rounded-2xl bg-[#151C27] border border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 flex items-center justify-center text-[#3B9EFF] mb-3.5">
              <Film className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-[#F5F7FA]">Unified Library</h2>
            <p className="text-xs text-[#A8B0BD] mt-1.5 leading-relaxed">
              Track movies, multi-season series, and anime with accurate episode progress, status tags, and custom ratings in one place.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#151C27] border border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] mb-3.5">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-[#F5F7FA]">Editorial Discovery</h2>
            <p className="text-xs text-[#A8B0BD] mt-1.5 leading-relaxed">
              Find films through thematic genre vaults and curated databases powered by global entertainment sources.
            </p>
          </div>
        </div>

        {/* Narrative */}
        <section className="space-y-4 text-sm text-[#A8B0BD] leading-relaxed border-t border-white/[0.06] pt-8">
          <h2 className="text-lg font-bold text-[#F5F7FA] tracking-tight">
            Our Philosophy
          </h2>
          <p>
            Cinema cataloging shouldn&apos;t feel like data entry or an ad-heavy social feed. CineTrack was engineered to combine the clean utility of a personal ledger with the beauty of an editorial cinema magazine.
          </p>
          <p>
            Whether you are logging a 1950s arthouse masterpiece or keeping pace with weekly anime simulcasts, the interface stays calm, fast, and responsive.
          </p>
        </section>

        {/* Footer Link Navigation */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-4 text-xs font-medium text-[#A8B0BD]">
          <Link
            href="/contact"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Have questions? Contact us</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
