import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { sanitizeRedirect } from "@/lib/security";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = sanitizeRedirect(requestUrl.searchParams.get("next"), "/library");
  const supabase = await createClient();

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") || host.includes("192.168.") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (!error && data?.url) {
    return redirect(data.url);
  }

  return redirect(`/login?error=${encodeURIComponent(error?.message || "auth_failed")}`);
}
