import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "forsa_session";
const VISITOR_COOKIE = "forsa_visitor";
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/profile", "/calendar", "/applications", "/subscribe"];

export function middleware(request: NextRequest) {
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (isProtected) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Anonymous visitor cookie — lets us count real people (including guests
  // browsing without an account) for admin analytics, without any personal
  // data attached. Only ever set here; the actual DB write happens
  // server-side on each tracked page (Node.js runtime, not this edge one).
  const response = NextResponse.next();
  if (!request.cookies.has(VISITOR_COOKIE)) {
    response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/calendar/:path*",
    "/applications/:path*",
    "/opportunities/:path*",
    "/organizations/:path*",
  ],
};
