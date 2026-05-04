import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7243/api';
const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'sss_access_token';
const REFRESH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_REFRESH_KEY || 'sss_refresh_token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function getTokenMaxAgeSeconds(token: string): number | undefined {
  try {
    const payload = token.split('.')[1];
    if (!payload) return undefined;

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const exp = Number(decoded?.exp);
    if (!Number.isFinite(exp)) return undefined;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const remainingSeconds = exp - nowInSeconds;
    return remainingSeconds > 0 ? remainingSeconds : 0;
  } catch {
    return undefined;
  }
}

async function tryRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshSetCookie: string | null } | null> {
  try {
    const response = await fetch(joinUrl(BACKEND_API_URL, '/auth/refresh'), {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    const payload = data?.data ?? data;

    if (!payload?.accessToken) return null;

    return {
      accessToken: payload.accessToken,
      refreshSetCookie: response.headers.get('set-cookie') || null,
    };
  } catch {
    return null;
  }
}

function cloneHeadersForBackend(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');
  return headers;
}

async function forwardCreateRoadMap(
  request: NextRequest,
  accessToken: string | undefined,
  body: string
): Promise<Response> {
  const targetUrl = joinUrl(BACKEND_API_URL, `/ai/create-road-map${request.nextUrl.search}`);
  const headers = cloneHeadersForBackend(request);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(targetUrl, {
    method: 'POST',
    headers,
    body,
    cache: 'no-store',
  });
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin') || '*';
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value || request.cookies.get('refreshToken')?.value;

  const body = await request.text();
  let response = await forwardCreateRoadMap(request, accessToken, body);

  let refreshed: { accessToken: string; refreshSetCookie: string | null } | null = null;

  if (response.status === 401 && refreshToken) {
    refreshed = await tryRefreshToken(refreshToken);

    if (refreshed?.accessToken) {
      response = await forwardCreateRoadMap(request, refreshed.accessToken, body);
    }
  }

  const proxyResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });

  const origin = request.headers.get('origin');
  if (origin) {
    proxyResponse.headers.set('Access-Control-Allow-Origin', origin);
    proxyResponse.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (refreshed?.accessToken) {
    const refreshedAccessMaxAge = getTokenMaxAgeSeconds(refreshed.accessToken);
    proxyResponse.cookies.set(AUTH_TOKEN_KEY, refreshed.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...(typeof refreshedAccessMaxAge === 'number' ? { maxAge: refreshedAccessMaxAge } : {}),
    });

    if (refreshed.refreshSetCookie) {
      proxyResponse.headers.append('set-cookie', refreshed.refreshSetCookie);
    }
  }

  return proxyResponse;
}
