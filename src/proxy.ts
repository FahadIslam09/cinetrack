import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /@username to internal route /u/[username]
  if (pathname.startsWith("/@")) {
    const username = pathname.slice(2);
    const url = request.nextUrl.clone();
    url.pathname = `/u/${username}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
