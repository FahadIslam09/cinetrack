import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/library";

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") || host.includes("192.168.") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Ensure profile row exists in database
      try {
        const [existingProfile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, data.user.id))
          .limit(1);

        if (!existingProfile) {
          const generatedUsername =
            data.user.user_metadata?.user_name ||
            data.user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "") ||
            `user_${data.user.id.slice(0, 8)}`;

          await db
            .insert(profiles)
            .values({
              id: data.user.id,
              username: generatedUsername.slice(0, 15).toLowerCase(),
              fullName:
                data.user.user_metadata?.full_name ||
                data.user.email?.split("@")[0],
              avatarUrl: data.user.user_metadata?.avatar_url,
              preferredCountry: "US",
            })
            .onConflictDoNothing();
        }
      } catch (profileErr) {
        console.error("Profile sync error on callback:", profileErr);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to login with error query param
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
