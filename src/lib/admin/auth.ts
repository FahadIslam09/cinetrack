import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns the authenticated admin profile, or null if the user is not
 * signed in or does not hold the 'admin' role.
 */
export async function getAdminProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile || profile.role !== "admin" || profile.status !== "active") return null;

  return {
    id: profile.id,
    username: profile.username,
    fullName: profile.fullName,
    avatarUrl: profile.avatarUrl,
    email: user.email,
  };
}

/**
 * Server-side gate for admin pages. Redirects non-admins to the home page.
 */
export async function requireAdmin() {
  const admin = await getAdminProfile();
  if (!admin) redirect("/");
  return admin;
}
