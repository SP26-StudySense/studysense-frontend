import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
    isAuthRoute,
    isProtectedRoute,
    isAnalystRoute,
    routes,
} from '@/shared/config/routes';
import { env } from '@/shared/config/env';

// The claim key ASP.NET Core Identity uses for roles in JWT
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

/**
 * Decode roles from a JWT token without external libraries.
 * Works in Next.js Edge runtime.
 */
function getRolesFromToken(token: string): string[] {
    try {
        const payload = token.split('.')[1];
        if (!payload) return [];
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const roleValue = decoded[ROLE_CLAIM];
        if (!roleValue) return [];
        return Array.isArray(roleValue) ? roleValue : [roleValue];
    } catch {
        return [];
    }
}

// API Proxy prefix
const API_PROXY_PREFIX = '/api/proxy';

// Backend API URL - HTTPS port 7243
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7243/api';

function getBackendRootUrl(apiUrl: string): string {
    return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
}

const BACKEND_ROOT_URL = getBackendRootUrl(BACKEND_API_URL);

function isRootApiPath(apiPath: string): boolean {
    return apiPath.startsWith('/ai/');
}

/**
 * Handle API proxy requests
 * Forward requests from /api/proxy/* to backend API
 */
async function handleApiProxy(request: NextRequest): Promise<NextResponse> {
    const { pathname, search } = request.nextUrl;

    // Remove the /api/proxy prefix to get the actual API path
    const apiPath = pathname.replace(API_PROXY_PREFIX, '');
    const useRootBase = isRootApiPath(apiPath);
    const targetBase = useRootBase ? BACKEND_ROOT_URL : BACKEND_API_URL;
    const targetUrl = `${targetBase}${apiPath}${search}`;

    console.log('[Proxy] Request:', {
        method: request.method,
        pathname,
        apiPath,
        targetBase,
        targetUrl,
    });

    // Get access token from cookies
    const accessToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_TOKEN_KEY)?.value;
    const refreshToken =
        request.cookies.get(env.NEXT_PUBLIC_AUTH_REFRESH_KEY)?.value ||
        request.cookies.get('refreshToken')?.value;

    // Prepare headers
    const headers = new Headers(request.headers);
    headers.delete('host');

    // Handle Content-Type header - only set for requests with body (POST, PUT, PATCH)
    const originalContentType = request.headers.get('Content-Type');
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'DELETE') {
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
        // Get request body for non-GET/HEAD/DELETE requests
        // DELETE requests typically don't have a body
        let body: BodyInit | undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'DELETE') {
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

        if (isRootApiPath(apiPath)) {
            console.log('[Proxy][RootApi] Forwarded request:', {
                method: request.method,
                apiPath,
                targetUrl,
                status: response.status,
                statusText: response.statusText,
            });
        }

        if (!response.ok && isRootApiPath(apiPath)) {
            let backendErrorBody = '';
            try {
                backendErrorBody = await response.clone().text();
            } catch {
                backendErrorBody = '[Proxy][RootApi] Cannot read error body';
            }

            console.error('[Proxy][RootApi] Backend non-2xx response:', {
                method: request.method,
                targetUrl,
                status: response.status,
                statusText: response.statusText,
                body: backendErrorBody,
            });
        }

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

                // Forward rotated refresh cookie from backend refresh response.
                // Backend owns refresh token value (HttpOnly) and does not return it in JSON.
                if (refreshed.refreshSetCookie) {
                    proxyResponse.headers.append('set-cookie', refreshed.refreshSetCookie);
                }

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
async function tryRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshSetCookie: string | null } | null> {
    try {
        const response = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const payload = data?.data ?? data;

        if (!payload?.accessToken) {
            return null;
        }

        return {
            accessToken: payload.accessToken,
            refreshSetCookie: response.headers.get('set-cookie') || null,
        };
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

    // Protect analyst routes: must be authenticated and have Analyst role
    if (isAnalystRoute(pathname)) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL(routes.public.home, request.url));
        }
        const roles = getRolesFromToken(accessToken!);
        if (!roles.includes('Analyst')) {
            return NextResponse.redirect(new URL(routes.public.home, request.url));
        }
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