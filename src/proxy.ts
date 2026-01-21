import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  isAuthRoute,
  isProtectedRoute,
  isAdminRoute,
  routes,
} from '@/shared/config/routes';
import { env } from '@/shared/config/env';

// API Proxy prefix
const API_PROXY_PREFIX = '/api/proxy';

// Backend API URL (server-side only)
const BACKEND_API_URL = process.env.API_URL || 'https://localhost:7243/api';
const BACKEND_API_URL_HTTP = process.env.API_URL_HTTP || 'http://localhost:5254/api';

/**
 * Handle API proxy requests
 * Forward requests from /api/proxy/* to backend API
 */
async function handleApiProxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  // Remove the /api/proxy prefix to get the actual API path
  const apiPath = pathname.replace(API_PROXY_PREFIX, '');
  const targetUrl = `${BACKEND_API_URL}${apiPath}${search}`;

  // Get access token from cookies
  const accessToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_REFRESH_KEY)?.value;

  // Prepare headers
  const headers = new Headers(request.headers);
  headers.delete('host');

  // Don't set Content-Type for GET/HEAD requests - prevents backend from trying to parse empty body as JSON
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
  } else {
    headers.delete('Content-Type');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  try {
    // Get request body for non-GET requests
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }

    // Forward request to backend
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    // Handle 401 - Token expired, try to refresh
    if (response.status === 401 && refreshToken && !pathname.includes('/auth/refresh')) {
      const refreshed = await tryRefreshToken(refreshToken);

      if (refreshed) {
        // Retry request with new access token
        headers.set('Authorization', `Bearer ${refreshed.accessToken}`);

        const retryResponse = await fetch(targetUrl, {
          method: request.method,
          headers,
          body,
        });

        const proxyResponse = new NextResponse(retryResponse.body, {
          status: retryResponse.status,
          statusText: retryResponse.statusText,
          headers: retryResponse.headers,
        });

        // Set new tokens in cookies
        proxyResponse.cookies.set(env.NEXT_PUBLIC_AUTH_TOKEN_KEY, refreshed.accessToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 1 day
        });
        proxyResponse.cookies.set(env.NEXT_PUBLIC_AUTH_REFRESH_KEY, refreshed.refreshToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return proxyResponse;
      }
    }

    // Return proxied response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('[Proxy Error]', error);
    return NextResponse.json(
      { success: false, message: 'Proxy error', error: String(error) },
      { status: 502 }
    );
  }
}

/**
 * Try to refresh access token
 */
async function tryRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data; // { accessToken, refreshToken }
  } catch {
    return null;
  }
}

/**
 * Main proxy function
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle API proxy requests
  if (pathname.startsWith(API_PROXY_PREFIX)) {
    return handleApiProxy(request);
  }

  // Get token from cookies for route protection
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * 
     * Note: /api/proxy is now included for API proxying
     */
    '/((?!_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
