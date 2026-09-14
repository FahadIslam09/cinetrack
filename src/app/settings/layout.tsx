import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SettingsNav } from "@/components/settings/settings-nav";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Settings · CineTrack",
  description: "Manage your profile, credentials, and account security settings on CineTrack.",
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings");
  }

  return (
    <div className="min-h-screen bg-[#0F141D] text-[#F5F7FA] pb-24 md:pb-12">
      <AppHeader
        user={{
          email: user.email,
          avatarUrl: user.user_metadata?.avatar_url,
          username: user.user_metadata?.user_name || user.email?.split("@")[0],
        }}
      />

      <main className="w-full max-w-[860px] mx-auto px-4 sm:px-6 pt-24 sm:pt-28">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A8B0BD] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Library</span>
          </Link>
        </div>

        {/* Settings Header & Tabs */}
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#F5F7FA] tracking-tight">
            Settings
          </h1>

          <SettingsNav />
        </div>

        {/* Tab Content */}
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
