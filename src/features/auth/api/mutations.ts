/**
 * Auth API mutations using React Query
 * Updated to match AUTH_API_README.md specifications
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

import { post, get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import { routes } from '@/shared/config/routes';
import { env } from '@/shared/config';
import { toast } from '@/shared/lib';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  RefreshTokenResponse,
  ConfirmEmailRequest,
  ConfirmEmailResponse,
  GoogleLoginCallbackData,
  User,
} from '../types';
import type { SurveyStatusResponse } from '@/features/survey/types';

// Token storage key from env
const ACCESS_TOKEN_KEY = env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const USER_STORAGE_KEY = 'sss_user';

/**
 * Set access token in cookie
 */
function setAccessToken(accessToken: string, expiresUtc?: string): void {
  const expiresDate = expiresUtc ? new Date(expiresUtc) : undefined;
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    expires: expiresDate || 1, // 1 day default
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

/**
 * Clear access token from cookie
 */
function clearAccessToken(): void {
  Cookies.remove(ACCESS_TOKEN_KEY);
}

/**
 * Save user data to localStorage for persistence across page reloads
 */
export function saveUserToStorage(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

/**
 * Get user data from localStorage
 */
export function getUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
}

/**
 * Clear user data from localStorage
 */
function clearUserFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/**
 * Check survey status and redirect accordingly
 * Returns the URL to redirect to: / (landing page after login)
 * Survey redirects are handled separately when selecting template roadmaps
 */
async function getPostLoginRedirectUrl(): Promise<string> {
  // After login, redirect to landing page
  return routes.public.home;
}

/**
 * Login mutation
 * Response includes accessToken directly (not nested in tokens)
 * Refresh token is automatically set via HttpOnly cookie by backend
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      post<LoginResponse>(endpoints.auth.login, data),
    onSuccess: async (response) => {
      // Store access token in cookie
      setAccessToken(response.accessToken, response.accessTokenExpiresUtc);

      // Save user to localStorage for persistence across reloads
      saveUserToStorage(response.user);

      // Update user cache
      queryClient.setQueryData(queryKeys.auth.me(), response.user);

      // Check if user needs to complete initial survey
      try {
        const surveyStatus = await get<SurveyStatusResponse>('/users/survey-status');

        if (surveyStatus.requiresInitialSurvey && surveyStatus.surveyId) {
          console.log('[Login] User needs to complete initial survey, redirecting...');

          // Show info toast about survey
          toast.info('Welcome! Please complete the initial survey', {
            description: 'This helps us personalize your learning experience',
          });

          // Redirect to initial survey page
          router.push('/surveys/initial-survey');
          return; // Stop here, don't proceed to dashboard
        }
      } catch (error) {
        console.error('[Login] Failed to check survey status:', error);
        // If survey status check fails, continue with normal login flow
      }

      // Show success toast
      toast.success('Login successful!', {
        description: `Welcome ${response.user.firstName || response.user.email}`,
      });

      // Redirect to roadmaps selection page
      const redirectUrl = await getPostLoginRedirectUrl();

      console.log('[Login] Redirecting to:', redirectUrl);
      router.push(redirectUrl);
    },
    onError: (error) => {
      // Clear any stale auth data
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });

      // Show error toast
      toast.apiError(error, 'Login failed');
    },
  });
}

/**
 * Register mutation
 * Note: Backend requires email confirmation before login
 * Returns message only, no auto-login
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      post<RegisterResponse>(endpoints.auth.register, data),
    onSuccess: (response) => {
      toast.success('Registration successful!', {
        description: response.message || 'Please check your email to confirm your account.',
      });
    },
    onError: (error) => {
      toast.apiError(error, 'Registration failed');
    },
  });
}

/**
 * Logout mutation
 * Clears tokens and invalidates session
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => post<{ message: string }>(endpoints.auth.logout),
    onSuccess: () => {
      // No toast on logout as requested
    },
    onSettled: () => {
      // Always clear tokens and cache, even if logout API fails
      clearAccessToken();
      clearUserFromStorage();
      queryClient.clear();
      router.push(routes.auth.login);
    },
  });
}

/**
 * Refresh token mutation
 * Refresh token is sent automatically via HttpOnly cookie
 */
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => post<RefreshTokenResponse>(endpoints.auth.refresh),
    onSuccess: (response) => {
      // Store new access token
      setAccessToken(response.accessToken, response.accessTokenExpiresUtc);

      // Update user cache
      queryClient.setQueryData(queryKeys.auth.me(), response.user);
    },
    onError: () => {
      // Refresh failed - clear tokens
      clearAccessToken();
      queryClient.clear();

      toast.error('Session expired', {
        description: 'Please log in again.',
      });
    },
  });
}

/**
 * Forgot password mutation
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      post<ForgotPasswordResponse>(endpoints.auth.forgotPassword, data),
    onSuccess: (response) => {
      toast.success('Email sent!', {
        description: response.message || 'Please check your inbox to reset your password.',
      });
    },
    onError: (error) => {
      toast.apiError(error, 'Failed to send reset email');
    },
  });
}

/**
 * Reset password mutation
 * Requires userId and token from email link
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      post<ResetPasswordResponse>(endpoints.auth.resetPassword, data),
    onSuccess: () => {
      toast.success('Password reset successful!', {
        description: 'You can now login with your new password.',
      });

      // Redirect to login with success message
      router.push(`${routes.auth.login}?reset=success`);
    },
    onError: (error) => {
      toast.apiError(error, 'Failed to reset password');
    },
  });
}

/**
 * Confirm email mutation (GET request with query params)
 * Note: Redirect is handled by the page component, not here
 * Uses direct fetch to backend to avoid middleware URL parsing issues with special characters in token
 */
export function useConfirmEmail() {
  return useMutation({
    mutationFn: async (params: ConfirmEmailRequest) => {
      // Encode token properly to handle special characters
      const encodedToken = encodeURIComponent(params.token);
      const encodedUserId = encodeURIComponent(params.userId);

      // Use the API proxy to avoid CORS and SSL certificate issues
      const url = `/api/proxy${endpoints.auth.confirmEmail}?userId=${encodedUserId}&token=${encodedToken}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to confirm email');
      }

      return response.json() as Promise<ConfirmEmailResponse>;
    },
    onSuccess: () => {
      toast.success('Email verified!', {
        description: 'Your account has been activated.',
      });
    },
    onError: (error) => {
      toast.apiError(error, 'Failed to verify email');
    },
  });
}

/**
 * Google login hook with popup-based OAuth flow
 */
export function useGoogleLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const popupRef = useRef<Window | null>(null);

  const handleMessage = useCallback(
    async (event: MessageEvent<GoogleLoginCallbackData>) => {
      console.log('[Google Login] Received message:', event.origin, event.data);

      // Validate origin - should match API origin
      const apiUrl = new URL(env.NEXT_PUBLIC_API_URL_HTTP);
      console.log('[Google Login] Expected origin:', apiUrl.origin);

      if (event.origin !== apiUrl.origin) {
        console.log('[Google Login] Origin mismatch, ignoring');
        return;
      }

      let { token, user, returnUrl, error } = event.data;

      if (error) {
        console.error('Google login failed:', error.message);
        toast.error('Google login failed', {
          description: error.message,
        });
        return;
      }

      if (token && user) {
        // ALWAYS normalize user data - backend may send PascalCase keys
        const anyUser = user as any;
        console.log('[Google Login] Raw user data:', JSON.stringify(anyUser));

        const normalizedUser = {
          id: anyUser.id || anyUser.Id || '',
          email: anyUser.email || anyUser.Email || '',
          firstName: anyUser.firstName || anyUser.FirstName || null,
          lastName: anyUser.lastName || anyUser.LastName || null,
          // Try all common avatar URL variations
          avatarUrl: anyUser.avatarUrl || anyUser.AvatarUrl || anyUser.avatar_url
            || anyUser.picture || anyUser.Picture
            || anyUser.photoUrl || anyUser.PhotoUrl
            || anyUser.profilePicture || anyUser.ProfilePicture
            || anyUser.imageUrl || anyUser.ImageUrl
            || null,
          roles: anyUser.roles || anyUser.Roles || [],
        };


        console.log('[Google Login] Normalized user data:', JSON.stringify(normalizedUser));

        // Store access token
        setAccessToken(token);

        // Save NORMALIZED user to localStorage for persistence across reloads
        saveUserToStorage(normalizedUser);

        // Update user cache with NORMALIZED data
        queryClient.setQueryData(queryKeys.auth.me(), normalizedUser);

        // Check if user needs to complete initial survey
        try {
          const surveyStatus = await get<SurveyStatusResponse>('/users/survey-status');

          if (surveyStatus.requiresInitialSurvey && surveyStatus.surveyId) {
            console.log('[Google Login] User needs to complete initial survey, redirecting...');

            // Show info toast about survey
            toast.info('Welcome! Please complete the initial survey', {
              description: 'This helps us personalize your learning experience',
            });

            // Close popup if still open
            if (popupRef.current && !popupRef.current.closed) {
              popupRef.current.close();
            }

            // Redirect to initial survey page
            router.push('/surveys/initial-survey');
            return; // Stop here, don't proceed to dashboard
          }
        } catch (error) {
          console.error('[Google Login] Failed to check survey status:', error);
          // If survey status check fails, continue with normal login flow
        }

        // Show success toast
        toast.success('Login successful!', {
          description: `Welcome ${normalizedUser.firstName || normalizedUser.email}`,
        });

        // Redirect to roadmaps selection page
        const redirectUrl = await getPostLoginRedirectUrl();
        console.log('[Google Login] Redirecting to:', redirectUrl);

        // Redirect
        router.push(redirectUrl);
      }

      // Close popup if still open
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    },
    [queryClient, router]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const loginWithGoogle = useCallback((returnUrl: string = '/') => {
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    // Include opener origin so backend knows where to postMessage
    const openerOrigin = window.location.origin;
    const googleLoginUrl = `${env.NEXT_PUBLIC_API_URL_HTTP}${endpoints.auth.googleLogin}?returnUrl=${encodeURIComponent(returnUrl)}&opener=${encodeURIComponent(openerOrigin)}`;

    popupRef.current = window.open(
      googleLoginUrl,
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }, []);

  return { loginWithGoogle };
}
