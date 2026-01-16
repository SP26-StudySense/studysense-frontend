/**
 * Auth API mutations using React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { post } from '@/shared/api/client';
import { setTokens, clearTokens } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import { queryKeys } from '@/shared/api/query-keys';
import { routes } from '@/shared/config/routes';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '../types';

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      post<LoginResponse>(endpoints.auth.login, data),
    onSuccess: (response) => {
      // Store tokens
      setTokens(response.tokens.accessToken, response.tokens.refreshToken);

      // Update user cache
      queryClient.setQueryData(queryKeys.auth.me(), response.user);

      // Redirect to dashboard
      router.push(routes.dashboard.home);
    },
    onError: () => {
      // Clear any stale auth data
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      post<RegisterResponse>(endpoints.auth.register, data),
    onSuccess: (response) => {
      // Store tokens
      setTokens(response.tokens.accessToken, response.tokens.refreshToken);

      // Update user cache
      queryClient.setQueryData(queryKeys.auth.me(), response.user);

      // Redirect to dashboard or onboarding
      router.push(routes.dashboard.home);
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => post<void>(endpoints.auth.logout),
    onSettled: () => {
      // Always clear tokens and cache, even if logout API fails
      clearTokens();
      queryClient.clear();
      router.push(routes.auth.login);
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
  });
}

/**
 * Reset password mutation
 */
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      post<ResetPasswordResponse>(endpoints.auth.resetPassword, data),
    onSuccess: () => {
      // Redirect to login with success message
      router.push(`${routes.auth.login}?reset=success`);
    },
  });
}

/**
 * Verify email mutation
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyEmailRequest) =>
      post<VerifyEmailResponse>(endpoints.auth.verifyEmail, data),
    onSuccess: () => {
      // Invalidate user query to refresh email verification status
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}
