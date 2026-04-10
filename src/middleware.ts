import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
    isAuthRoute,
    isProtectedRoute,
    isAdminRoute,
    isAnalystRoute,
    isContentManagerRoute,
    isStudyPlanRoute,
    routes,
} from '@/shared/config/routes';
import { env } from '@/shared/config/env';

// The claim key ASP.NET Core Identity uses for roles in JWT
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const ENABLE_AUTH_DEBUG =
    process.env.AUTH_DEBUG === 'true' || process.env.NODE_ENV !== 'production';

function authDebugLog(event: string, details: Record<string, unknown> = {}): void {
    if (!ENABLE_AUTH_DEBUG) return;
    console.log('[AuthDebug]', event, details);
}

function hasRole(roles: string[], targetRole: string): boolean {
    const normalizedTargetRole = targetRole.replace(/\s+/g, '').toLowerCase();
    return roles.some((role) => role.replace(/\s+/g, '').toLowerCase() === normalizedTargetRole);
}

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

function isTokenExpired(token: string): boolean {
    try {
        const payload = token.split('.')[1];
        if (!payload) return true;

        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const exp = Number(decoded?.exp);

        if (!Number.isFinite(exp)) {
            return true;
        }

        const nowInSeconds = Math.floor(Date.now() / 1000);
        return exp <= nowInSeconds;
    } catch {
        return true;
    }
}

function getTokenExpiryMeta(token?: string): {
    present: boolean;
    expired: boolean;
    exp?: number;
    expiresInSec?: number;
} {
    if (!token) {
        return { present: false, expired: true };
    }

    try {
        const payload = token.split('.')[1];
        if (!payload) return { present: true, expired: true };

        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        const exp = Number(decoded?.exp);
        if (!Number.isFinite(exp)) {
            return { present: true, expired: true };
        }

        const nowInSeconds = Math.floor(Date.now() / 1000);
        return {
            present: true,
            expired: exp <= nowInSeconds,
            exp,
            expiresInSec: exp - nowInSeconds,
        };
    } catch {
        return { present: true, expired: true };
    }
}

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

    // Handle OPTIONS requests natively
    if (request.method === 'OPTIONS') {
        const origin = request.headers.get('origin') || '*';
        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    // Get access token from cookies
    const accessToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_TOKEN_KEY)?.value;
    const refreshToken =
        request.cookies.get(env.NEXT_PUBLIC_AUTH_REFRESH_KEY)?.value ||
        request.cookies.get('refreshToken')?.value;

    authDebugLog('proxy_request_start', {
        pathname,
        method: request.method,
        accessToken: getTokenExpiryMeta(accessToken),
        hasRefreshToken: !!refreshToken,
    });

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

        // Handle 401 - Token expired, try to refresh
        if (response.status === 401 && refreshToken && !pathname.includes('/auth/refresh')) {
            authDebugLog('proxy_401_received', {
                pathname,
                method: request.method,
                hasRefreshToken: !!refreshToken,
            });
            const refreshed = await tryRefreshToken(refreshToken);

            if (refreshed) {
                authDebugLog('proxy_refresh_success_retrying', {
                    pathname,
                    method: request.method,
                });
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

            authDebugLog('proxy_refresh_failed_after_401', {
                pathname,
                method: request.method,
            });
        }

        // Return proxied response
        const proxyResponseHeaders = new Headers(response.headers);
        const requestOrigin = request.headers.get('origin') || '*';
        proxyResponseHeaders.set('Access-Control-Allow-Origin', requestOrigin);
        proxyResponseHeaders.set('Access-Control-Allow-Credentials', 'true');

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: proxyResponseHeaders,
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
        authDebugLog('refresh_attempt', {
            hasRefreshToken: !!refreshToken,
        });

        const response = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
            },
        });

        if (!response.ok) {
            authDebugLog('refresh_failed_http', {
                status: response.status,
                statusText: response.statusText,
            });
            return null;
        }

        const data = await response.json();
        const payload = data?.data ?? data;

        if (!payload?.accessToken) {
            authDebugLog('refresh_failed_no_access_token', {});
            return null;
        }

        authDebugLog('refresh_success', {
            hasRotatedRefreshCookie: !!response.headers.get('set-cookie'),
            accessToken: getTokenExpiryMeta(payload.accessToken),
        });

        return {
            accessToken: payload.accessToken,
            refreshSetCookie: response.headers.get('set-cookie') || null,
        };
    } catch (error) {
        authDebugLog('refresh_exception', {
            message: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}

/**
 * Main middleware function
 */
function applyRefreshedAuthCookies(
    response: NextResponse,
    refreshed: { accessToken: string; refreshSetCookie: string | null } | null
): NextResponse {
    if (!refreshed) {
        return response;
    }

    response.cookies.set(env.NEXT_PUBLIC_AUTH_TOKEN_KEY, refreshed.accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
    });

    if (refreshed.refreshSetCookie) {
        response.headers.append('set-cookie', refreshed.refreshSetCookie);
    }

    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isAuthPath = isAuthRoute(pathname);

    // Handle API proxy requests
    if (pathname.startsWith(API_PROXY_PREFIX)) {
        return handleApiProxy(request);
    }

    // Get token from cookies for route protection
    let accessToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_TOKEN_KEY)?.value;
    const refreshToken =
        request.cookies.get(env.NEXT_PUBLIC_AUTH_REFRESH_KEY)?.value ||
        request.cookies.get('refreshToken')?.value;

    let refreshedAuth: { accessToken: string; refreshSetCookie: string | null } | null = null;
    const hasExpiredAccessToken = !!accessToken && isTokenExpired(accessToken);

    authDebugLog('middleware_entry', {
        pathname,
        isAuthPath,
        isProtected: isProtectedRoute(pathname),
        accessToken: getTokenExpiryMeta(accessToken),
        hasRefreshToken: !!refreshToken,
    });

    if (!isAuthPath && refreshToken && (!accessToken || hasExpiredAccessToken)) {
        authDebugLog('middleware_refresh_needed', {
            pathname,
            reason: !accessToken ? 'missing_access_token' : 'expired_access_token',
        });
        refreshedAuth = await tryRefreshToken(refreshToken);
        if (refreshedAuth?.accessToken) {
            accessToken = refreshedAuth.accessToken;
            authDebugLog('middleware_refresh_applied', {
                pathname,
                accessToken: getTokenExpiryMeta(accessToken),
            });
        } else {
            authDebugLog('middleware_refresh_not_applied', {
                pathname,
            });
        }
    }

    const isAuthenticated = !!accessToken && !isTokenExpired(accessToken);

    authDebugLog('middleware_auth_evaluated', {
        pathname,
        isAuthenticated,
        accessToken: getTokenExpiryMeta(accessToken),
    });

    // Redirect authenticated users away from auth pages
    if (isAuthPath && isAuthenticated) {
        const roles = getRolesFromToken(accessToken!);
        authDebugLog('middleware_auth_page_redirect', {
            pathname,
            roles,
        });
        if (hasRole(roles, 'ContentManager')) {
            const response = NextResponse.redirect(new URL(routes.contentManager.dashboard, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
        if (hasRole(roles, 'Admin')) {
            const response = NextResponse.redirect(new URL(routes.admin.home, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
        const response = NextResponse.redirect(new URL(routes.dashboard.home, request.url));
        return applyRefreshedAuthCookies(response, refreshedAuth);
    }

    // Redirect unauthenticated users to login for protected routes
    if (isProtectedRoute(pathname) && !isAuthenticated) {
        const loginUrl = new URL(routes.auth.login, request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        authDebugLog('middleware_redirect_to_login', {
            pathname,
            loginUrl: `${loginUrl.pathname}${loginUrl.search}`,
            accessToken: getTokenExpiryMeta(accessToken),
            hasRefreshToken: !!refreshToken,
        });
        const response = NextResponse.redirect(loginUrl);
        return applyRefreshedAuthCookies(response, refreshedAuth);
    }

    if (isAdminRoute(pathname)) {
        if (!isAuthenticated) {
            const response = NextResponse.redirect(new URL(routes.public.home, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
        const roles = getRolesFromToken(accessToken!);
        if (!hasRole(roles, 'Admin')) {
            const response = NextResponse.redirect(new URL(routes.public.home, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
    }

    // Protect analyst routes: must be authenticated and have Analyst role
    if (isAnalystRoute(pathname)) {
        if (!isAuthenticated) {
            const response = NextResponse.redirect(new URL(routes.public.home, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
        const roles = getRolesFromToken(accessToken!);
        if (!hasRole(roles, 'Analyst')) {
            const response = NextResponse.redirect(new URL(routes.public.home, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
    }

    if (isContentManagerRoute(pathname)) {
        if (!isAuthenticated) {
            const response = NextResponse.redirect(new URL(routes.public.home, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
        const roles = getRolesFromToken(accessToken!);
        if (!hasRole(roles, 'ContentManager')) {
            const response = NextResponse.redirect(new URL(routes.public.home, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
    }

    if (isStudyPlanRoute(pathname)) {
        if (!isAuthenticated) {
            const response = NextResponse.redirect(new URL(routes.public.home, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
        const roles = getRolesFromToken(accessToken!);
        if (!hasRole(roles, 'User')) {
            const response = NextResponse.redirect(new URL(routes.public.home, request.url));
            return applyRefreshedAuthCookies(response, refreshedAuth);
        }
    }

    const response = NextResponse.next();
    return applyRefreshedAuthCookies(response, refreshedAuth);
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