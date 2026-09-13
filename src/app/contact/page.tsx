import { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
import { createClient } from "@/lib/supabase/server";
import { Mail, MessageSquare, ArrowRight, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact · CineTrack",
  description: "Get in touch with the creator of CineTrack for feedback, suggestions, or questions.",
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
            Let&apos;s talk cinema and ideas
          </h1>
          <p className="text-base text-[#A8B0BD] mt-3 leading-relaxed">
            CineTrack is built by a solo developer who loves movies and anime. If you ran into a bug, have an idea for a new feature, or just want to share feedback, I would love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="p-6 rounded-2xl bg-[#151C27] border border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 flex items-center justify-center text-[#3B9EFF] mb-4">
              <Mail className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-[#F5F7FA]">Direct Email</h2>
            <p className="text-xs text-[#A8B0BD] mt-1.5 leading-relaxed">
              For bug reports, questions, feedback, or just a quick hello.
            </p>
            <a
              href="mailto:fahadislam.fir@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B9EFF] hover:text-[#5AAFFF] mt-4 transition-colors cursor-pointer break-all"
            >
              <span>fahadislam.fir@gmail.com</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-[#151C27] border border-white/[0.06] hover:border-[#3B9EFF]/30 transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 flex items-center justify-center text-[#3B9EFF] mb-4">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-[#F5F7FA]">Need a New Feature?</h2>
            <p className="text-xs text-[#A8B0BD] mt-1.5 leading-relaxed">
              Have an idea for a feature or encountered a bug while tracking? Submit a request directly.
            </p>
            <Link
              href="/feedback"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3B9EFF] hover:text-[#5AAFFF] mt-4 transition-colors cursor-pointer"
            >
              <span>Need a New Feature / Request Form</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <section className="p-6 rounded-2xl bg-[#151C27]/50 border border-white/[0.06] text-xs text-[#A8B0BD] space-y-2">
          <h3 className="font-semibold text-[#F5F7FA]">A quick note</h3>
          <p className="leading-relaxed">
            I read every single message. Because I build CineTrack in my personal time, replies might take a short while, but I genuinely appreciate your thoughts and support.
          </p>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
