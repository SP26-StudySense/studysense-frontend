import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/shared/config/env';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7243/api';
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const SUBMIT_QUIZ_TIMEOUT = 120000; // 120 seconds for quiz submission

/**
 * Decode roles from a JWT token
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

/**
 * Check if token is expired
 */
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

/**
 * Get remaining seconds for token expiry
 */
function getTokenMaxAgeSeconds(token: string): number | undefined {
	try {
		const payload = token.split('.')[1];
		if (!payload) return undefined;

		const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
		const exp = Number(decoded?.exp);
		if (!Number.isFinite(exp)) {
			return undefined;
		}

		const nowInSeconds = Math.floor(Date.now() / 1000);
		const remainingSeconds = exp - nowInSeconds;
		return remainingSeconds > 0 ? remainingSeconds : 0;
	} catch {
		return undefined;
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
			// Use normal timeout for refresh (30s)
			signal: AbortSignal.timeout(30000),
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
 * POST /api/proxy/quiz-attempts/[id]/submit
 * 
 * Extended timeout route handler for quiz submission.
 * Forwarding to backend with 120 second timeout to allow
 * time for processing all quiz answers and generating results.
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const targetUrl = `${BACKEND_API_URL}/quiz-attempts/${id}/submit`;

	// Get tokens from cookies
	const accessToken = request.cookies.get(env.NEXT_PUBLIC_AUTH_TOKEN_KEY)?.value;
	const refreshToken =
		request.cookies.get(env.NEXT_PUBLIC_AUTH_REFRESH_KEY)?.value ||
		request.cookies.get('refreshToken')?.value;

	try {
		// Prepare headers
		const headers = new Headers();
		headers.set('Content-Type', 'application/json');

		if (accessToken && !isTokenExpired(accessToken)) {
			headers.set('Authorization', `Bearer ${accessToken}`);
		}

		// Get request body
		const body = await request.text();

		// Forward request with 120 second timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), SUBMIT_QUIZ_TIMEOUT);

		try {
			const response = await fetch(targetUrl, {
				method: 'POST',
				headers,
				body,
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			// Handle 401 - Token may have expired, try to refresh
			if (response.status === 401 && refreshToken) {
				const refreshed = await tryRefreshToken(refreshToken);

				if (refreshed) {
					// Retry request with new access token
					headers.set('Authorization', `Bearer ${refreshed.accessToken}`);

					const retryController = new AbortController();
					const retryTimeoutId = setTimeout(() => retryController.abort(), SUBMIT_QUIZ_TIMEOUT);

					try {
						const retryResponse = await fetch(targetUrl, {
							method: 'POST',
							headers,
							body,
							signal: retryController.signal,
						});

						clearTimeout(retryTimeoutId);

						// Return retried response with refreshed tokens
						const responseBody = await retryResponse.text();
						const result = new NextResponse(responseBody, {
							status: retryResponse.status,
							statusText: retryResponse.statusText,
							headers: retryResponse.headers,
						});

						// Set new access token
						const refreshedAccessMaxAge = getTokenMaxAgeSeconds(refreshed.accessToken);
						result.cookies.set(env.NEXT_PUBLIC_AUTH_TOKEN_KEY, refreshed.accessToken, {
							httpOnly: false,
							secure: process.env.NODE_ENV === 'production',
							sameSite: 'lax',
							...(typeof refreshedAccessMaxAge === 'number'
								? { maxAge: refreshedAccessMaxAge }
								: {}),
						});

						// Set refreshed refresh token from backend response
						if (refreshed.refreshSetCookie) {
							result.headers.append('set-cookie', refreshed.refreshSetCookie);
						}

						return result;
					} catch (retryError) {
						clearTimeout(retryTimeoutId);
						throw retryError;
					}
				}
			}

			// Return original response
			const responseBody = await response.text();
			return new NextResponse(responseBody, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		} catch (fetchError) {
			clearTimeout(timeoutId);

			// Check if it's a timeout error
			if (fetchError instanceof Error) {
				if (fetchError.name === 'AbortError') {
					return NextResponse.json(
						{
							success: false,
							message: 'Quiz submission request exceeded timeout (120 seconds).',
							error: 'Request timeout',
						},
						{ status: 504 }
					);
				}
			}

			throw fetchError;
		}
	} catch (error) {
		console.error('[Quiz Submit Route Error]', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Failed to submit quiz attempt',
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 502 }
		);
	}
}
