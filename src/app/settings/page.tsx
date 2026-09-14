import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileSettingsView } from "@/components/settings/profile-settings-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile Settings · CineTrack",
};

export default async function SettingsProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/settings");
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile) {
    redirect("/library");
  }

  return (
    <ProfileSettingsView
      initialProfile={{
        id: profile.id,
        username: profile.username,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        backdropUrl: profile.backdropUrl,
        bio: profile.bio,
      }}
    />
  );
}
