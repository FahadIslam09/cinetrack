import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const RESERVED_ROUTES = new Set([
  "api",
  "_next",
  "auth",
  "admin",
  "discover",
  "landing",
  "library",
  "login",
  "profile",
  "search",
  "u",
  "movie",
  "series",
  "anime",
  "tv",
  "about",
  "contact",
  "feedback",
  "terms",
  "privacy",
]);

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value, cookie);
  });
}

export default async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  // 1. Guarded routes: /library and /profile require authentication
  if (!user) {
    if (pathname === "/library" || pathname.startsWith("/library/")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    if (pathname === "/profile" || pathname.startsWith("/profile/")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "?next=/profile";
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`;
      const redirectResponse = NextResponse.redirect(loginUrl);
      copyCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
  } else {
    // Authenticated users visiting /login get redirected to their library or next target
    if (pathname === "/login") {
      const nextTarget = request.nextUrl.searchParams.get("next") || "/library";
      const targetUrl = new URL(nextTarget, request.url);
      const redirectResponse = NextResponse.redirect(targetUrl);
      copyCookies(supabaseResponse, redirectResponse);
      return redirectResponse;
    }
  }

  // 2. Rewrite /@username to /u/[username]
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2);
    if (username) {
      const url = request.nextUrl.clone();
      url.pathname = `/u/${username}`;
      const rewriteResponse = NextResponse.rewrite(url, {
        request: { headers: request.headers },
      });
      copyCookies(supabaseResponse, rewriteResponse);
      return rewriteResponse;
    }
  }

  // 3. Check for root single-segment user handle: /username -> /u/username
  const match = pathname.match(/^\/([a-zA-Z0-9_.-]+)$/);
  if (match) {
    const slug = match[1];
    // If not a reserved route and not a static file with extension
    if (!RESERVED_ROUTES.has(slug.toLowerCase()) && !slug.includes(".")) {
      const url = request.nextUrl.clone();
      url.pathname = `/u/${slug}`;
      const rewriteResponse = NextResponse.rewrite(url, {
        request: { headers: request.headers },
      });
      copyCookies(supabaseResponse, rewriteResponse);
      return rewriteResponse;
    }
  }

  return supabaseResponse;
}

export { proxy };

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, svgs, etc.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
