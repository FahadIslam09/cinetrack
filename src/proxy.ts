import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RESERVED_ROUTES = new Set([
  "api",
  "_next",
  "auth",
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
]);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rewrite /@username to /u/[username]
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2);
    if (username) {
      const url = request.nextUrl.clone();
      url.pathname = `/u/${username}`;
      return NextResponse.rewrite(url);
    }
  }

  // 2. Check for root single-segment user handle: /username -> /u/username
  const match = pathname.match(/^\/([a-zA-Z0-9_.-]+)$/);
  if (match) {
    const slug = match[1];
    // If not a reserved route and not a static file with extension
    if (!RESERVED_ROUTES.has(slug.toLowerCase()) && !slug.includes(".")) {
      const url = request.nextUrl.clone();
      url.pathname = `/u/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
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
