import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const PROTECTED_PATHS = [
  "/profile",
  "/dashboard",
  // Add other protected paths here
];

// Paths that are only accessible to non-authenticated users
const AUTH_PATHS = ["/signin", "/signup", "/reset", "/verify"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // Get the token from cookies
  const token = request.cookies.get("auth_token");
  const isAuthenticated = !!token;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && isProtectedPath) {
    const redirectUrl = new URL("/signin", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside public)
     * 4. /images (inside public)
     * 5. all root files inside public (e.g. /favicon.ico)
     */
    "/((?!api|_next|fonts|images|[\\w-]+\\.\\w+).*)",
  ],
};
