import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  isAuthRoute,
  isProtectedRoute,
  isAdminRoute,
  routes,
} from '@/shared/config/routes';
import { env } from '@/shared/config/env';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const accessToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_TOKEN_KEY)?.value;
  const isAuthenticated = !!accessToken;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL(routes.dashboard.home, request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL(routes.auth.login, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: Role-based checks (admin routes) should be done client-side or via API
  // since we can't decode JWT in middleware without additional setup
  // The API will return 403 if user doesn't have required permissions

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
