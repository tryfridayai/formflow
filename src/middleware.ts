import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

/**
 * Protected route prefixes that require authentication.
 */
const PROTECTED_ROUTES = ["/dashboard", "/forms", "/settings"];

/**
 * Auth routes that authenticated users should be redirected away from.
 */
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle Supabase auth confirmation code at root URL
  // Supabase sends email confirmation links to /?code=xxx
  // Redirect them to /auth/callback?code=xxx for proper handling
  const code = searchParams.get('code');
  if (code && pathname === '/') {
    const callbackUrl = new URL('/auth/callback', request.url);
    callbackUrl.searchParams.set('code', code);
    const next = searchParams.get('next');
    if (next) callbackUrl.searchParams.set('next', next);
    return NextResponse.redirect(callbackUrl);
  }

  // Create the Supabase middleware client which handles session refresh
  const { supabase, response } = createMiddlewareClient(request);

  // Refresh the session. This is the primary purpose of the middleware.
  // getUser() makes a server-side call to verify the session and refresh
  // tokens if needed, writing updated cookies to the response.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user && !error;

  // Check if the current path matches a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current path is an auth route
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages to the dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets (svg, png, jpg, etc.)
     * - API routes that handle their own auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
