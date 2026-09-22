import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface LibraryPageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
  }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/library");
  }

  const resolvedParams = await searchParams;
  const query = new URLSearchParams();
  if (resolvedParams.status && resolvedParams.status !== "all") {
    query.set("status", resolvedParams.status);
  }
  if (resolvedParams.type && resolvedParams.type !== "all") {
    query.set("type", resolvedParams.type);
  }
  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : "";

  let targetUsername: string | null = null;
  try {
    const profileRows = await db
      .select({ username: profiles.username })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profileRows.length > 0 && profileRows[0].username) {
      targetUsername = profileRows[0].username;
    }
  } catch (err) {
    console.error("Library redirect error:", err);
  }

  const cookieStore = await cookies();

  if (targetUsername) {
    try {
      cookieStore.set("cinetrack_username", targetUsername, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    } catch {}
    redirect(`/${targetUsername}${suffix}`);
  }

  const fallbackUsername = user.user_metadata?.user_name;
  if (fallbackUsername) {
    try {
      cookieStore.set("cinetrack_username", fallbackUsername, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    } catch {}
    redirect(`/${fallbackUsername}${suffix}`);
  }

  redirect(`/profile${suffix}`);
}
