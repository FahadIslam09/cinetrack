import { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Privacy Policy · CineTrack",
  description: "Privacy Policy detailing how CineTrack handles user information and personal tracking data.",
};

export default async function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-[#22C55E] tracking-wider uppercase mb-4">
            Data &amp; Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA] leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#6F7886] mt-2">Last updated: September 2026</p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#A8B0BD] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">1. Information We Collect</h2>
            <p>
              When you register for an account, we collect your email address and chosen display credentials. When you interact with the platform, we store your media tracking logs, watch positions, custom ratings, reviews, and list preferences.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">2. How We Use Your Data</h2>
            <p>
              Your data is strictly utilized to provide and personalize your CineTrack experience: tracking what you watch, computing your series completion progress, calculating personal statistics, and presenting community recommendations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">3. Third-Party Services &amp; APIs</h2>
            <p>
              We integrate with entertainment metadata services (such as TMDb and AniList) to fetch movie, series, and anime information. These requests do not transmit your private tracking logs or personal identifiers to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">4. Data Retention &amp; Security</h2>
            <p>
              We implement industry-standard encryption and security measures to protect your account and tracking records. You retain full ownership of your data and may request account deletion or data export at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-[#F5F7FA]">5. Contact Regarding Privacy</h2>
            <p>
              For questions or concerns regarding this Privacy Policy or your personal data, reach out directly at{" "}
              <a href="mailto:fahadislam.fir@gmail.com" className="text-[#3B9EFF] hover:underline">
                fahadislam.fir@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-[#A8B0BD]">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms and Conditions
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
