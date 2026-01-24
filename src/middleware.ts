import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
    isAuthRoute,
    isProtectedRoute,
    routes,
} from '@/shared/config/routes';
import { env } from '@/shared/config/env';

// API Proxy prefix
const API_PROXY_PREFIX = '/api/proxy';

// Backend API URL - HTTPS port 7243
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7243/api';

/**
 * Handle API proxy requests
 * Forward requests from /api/proxy/* to backend API
 */
async function handleApiProxy(request: NextRequest): Promise<NextResponse> {
    const { pathname, search } = request.nextUrl;

    // Remove the /api/proxy prefix to get the actual API path
    const apiPath = pathname.replace(API_PROXY_PREFIX, '');
    const targetUrl = `${BACKEND_API_URL}${apiPath}${search}`;

    console.log('[Proxy] Request:', {
        method: request.method,
        pathname,
        apiPath,
        targetUrl,
    });

    // Get access token from cookies
    const accessToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_TOKEN_KEY)?.value;
    const refreshToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_REFRESH_KEY)?.value;

    // Prepare headers
    const headers = new Headers(request.headers);
    headers.delete('host');

    // Handle Content-Type header
    const originalContentType = request.headers.get('Content-Type');
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        if (!originalContentType) {
            headers.set('Content-Type', 'application/json');
        }
    } else {
        headers.delete('Content-Type');
    }

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    try {
        // Get request body for non-GET requests
        let body: BodyInit | undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            const contentType = request.headers.get('Content-Type') || '';

            if (contentType.includes('multipart/form-data')) {
                body = await request.arrayBuffer();
            } else {
                body = await request.text();
            }
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
        console.error('[Proxy Error Details]', {
            message: error instanceof Error ? error.message : String(error),
            cause: error instanceof Error ? (error as NodeJS.ErrnoException).cause : undefined,
            code: (error as NodeJS.ErrnoException).code,
            name: error instanceof Error ? error.name : undefined,
            targetUrl,
        });
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
        return data.data;
    } catch {
        return null;
    }
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
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
         */
        '/((?!_next/static|_next/image|favicon.ico|images|icons).*)',
    ],
};
