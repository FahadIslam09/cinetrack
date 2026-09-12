import { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
import { createClient } from "@/lib/supabase/server";
import { Mail, MessageSquare, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact · CineTrack",
  description: "Get in touch with the CineTrack team for feedback, support, and inquiries.",
};

export default async function ContactPage() {
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
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-[#3B9EFF] tracking-wider uppercase mb-4">
            Get in Touch
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA] leading-tight">
            Contact the CineTrack Team
          </h1>
          <p className="text-base text-[#A8B0BD] mt-3 leading-relaxed">
            We value feedback, bug reports, and suggestions from our community. Reach out through any of the channels below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="p-6 rounded-2xl bg-[#151C27] border border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 flex items-center justify-center text-[#3B9EFF] mb-4">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-[#F5F7FA]">Direct Inquiries</h2>
            <p className="text-xs text-[#A8B0BD] mt-1.5 leading-relaxed">
              For general questions, partnerships, and developer inquiries.
            </p>
            <a
              href="mailto:contact@cinetrack.app"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B9EFF] hover:text-[#5AAFFF] mt-4 transition-colors cursor-pointer"
            >
              <span>contact@cinetrack.app</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-[#151C27] border border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] mb-4">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-[#F5F7FA]">Feature Requests</h2>
            <p className="text-xs text-[#A8B0BD] mt-1.5 leading-relaxed">
              Have an idea for how we can make library management or movie discovery better?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22C55E] hover:text-[#4ADE80] mt-4 transition-colors cursor-pointer"
            >
              <span>Share an Idea on Home</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <section className="p-6 rounded-2xl bg-[#151C27]/50 border border-white/[0.06] text-xs text-[#A8B0BD] space-y-2">
          <h3 className="font-semibold text-[#F5F7FA]">Response Time</h3>
          <p className="leading-relaxed">
            We review community emails and feedback actively. Typical responses arrive within 24 to 48 business hours.
          </p>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
