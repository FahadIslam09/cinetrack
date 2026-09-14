import { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { createClient } from "@/lib/supabase/server";
import { Mail } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Need a Feature? Request Here · CineTrack",
  description:
    "Submit feature requests, bug reports, and recommendations directly to the creator of CineTrack.",
};

export default async function FeedbackPage() {
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
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <BackButton fallbackUrl="/" label="Back" />
        </div>

        {/* Header Cluster */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-[#3B9EFF] tracking-wider uppercase mb-3">
            Community Input
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA] leading-tight">
            Need a New Feature? Request Here
          </h1>
          <p className="text-sm sm:text-base text-[#A8B0BD] mt-2.5 leading-relaxed">
            Have an idea to make CineTrack better or ran into a bug? Every request is reviewed directly by the creator.
          </p>
        </div>

        {/* Main Interactive Form Component */}
        <FeedbackForm initialUserEmail={user?.email || null} />

        {/* Alternative Direct Inquiries Footer Card */}
        <div className="mt-8 p-5 rounded-2xl bg-[#151C27]/40 border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A8B0BD]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#3B9EFF] shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#F5F7FA]">Prefer direct email?</p>
              <p className="text-[#6F7886] mt-0.5">
                Send attachments or longer notes straight to the creator.
              </p>
            </div>
          </div>

          <a
            href="mailto:fahadislam.fir@gmail.com"
            className="text-xs font-semibold text-[#3B9EFF] hover:text-[#5AAFFF] transition-colors cursor-pointer shrink-0"
          >
            fahadislam.fir@gmail.com →
          </a>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
