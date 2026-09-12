import { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Terms and Conditions · CineTrack",
  description: "Terms and Conditions governing the use of the CineTrack cinema cataloging platform.",
};

export default async function TermsPage() {
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
            Legal &amp; Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA] leading-tight">
            Terms and Conditions
          </h1>
          <p className="text-xs text-[#6F7886] mt-2">Last updated: September 2026</p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#A8B0BD] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">1. Acceptance of Terms</h2>
            <p>
              By accessing and using CineTrack, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please discontinue using the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">2. User Accounts &amp; Data</h2>
            <p>
              When creating an account on CineTrack, you are responsible for maintaining the confidentiality of your authentication credentials and for all activities that occur under your account. You agree to provide accurate and complete information.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">3. Content &amp; Media Attribution</h2>
            <p>
              CineTrack provides media indexing, personal progress tracking, and community critique features. Movie, television, and anime metadata, titles, artwork, and character information are sourced via open entertainment APIs (including TMDb and AniList). CineTrack does not stream or host unauthorized media files.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">4. Community Conduct</h2>
            <p>
              Users may post reviews, logs, and custom list notes. You agree not to submit unlawful, defamatory, abusive, or infringing content. CineTrack reserves the right to remove content that violates community standards.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">5. Changes to Service</h2>
            <p>
              We are constantly evolving and improving CineTrack. We reserve the right to modify, suspend, or discontinue any feature or aspect of the platform with or without prior notice.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-[#A8B0BD]">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Read our Privacy Policy
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact Support
          </Link>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
