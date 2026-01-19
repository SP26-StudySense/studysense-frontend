/**
 * Custom hook that wraps useMutation with automatic toast notifications
 */

'use client';

import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

import { toast } from '@/shared/lib/toast';
import { ApiException } from '@/shared/api/errors';

export interface MutationWithToastOptions<TData, TError, TVariables, TContext>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  /**
   * Success message to show in toast
   * Can be a string or a function that receives the response data
   */
  successMessage?: string | ((data: TData) => string);

  /**
   * Whether to show error toast on mutation error
   * @default true
   */
  showErrorToast?: boolean;

  /**
   * Custom error message to show instead of the API error message
   */
  errorMessage?: string;

  /**
   * Description to show below the success message
   */
  successDescription?: string;
}

/**
 * A wrapper around useMutation that automatically shows toast notifications
 * for success and error states.
 *
 * @example
 * ```tsx
 * const mutation = useMutationWithToast({
 *   mutationFn: (data) => updateProfile(data),
 *   successMessage: 'Profile updated successfully!',
 *   showErrorToast: true, // default
 * });
 * ```
 */
export function useMutationWithToast<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: MutationWithToastOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {
    successMessage,
    successDescription,
    showErrorToast = true,
    errorMessage,
    onSuccess,
    onError,
    ...mutationOptions
  } = options;

  return useMutation({
    ...mutationOptions,
    onSuccess: (data, variables, context, client) => {
      // Show success toast if message is provided
      if (successMessage) {
        const message =
          typeof successMessage === 'function'
            ? successMessage(data)
            : successMessage;

        toast.success(message, {
          description: successDescription,
        });
      }

      // Call original onSuccess if provided
      onSuccess?.(data, variables, context, client);
    },
    onError: (error, variables, context, client) => {
      // Show error toast if enabled
      if (showErrorToast) {
        if (errorMessage) {
          toast.error(errorMessage);
        } else if (error instanceof ApiException) {
          toast.apiError(error);
        } else if (error instanceof Error) {
          toast.error(error.message || 'An error occurred');
        } else {
          toast.error('An unexpected error occurred');
        }
      }

      // Call original onError if provided
      onError?.(error, variables, context, client);
    },
  });
}

/**
 * Hook options for mutations that should show a promise toast
 * (loading -> success/error)
 */
export interface PromiseMutationOptions<TData, TError, TVariables, TContext>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  /**
   * Messages for the promise toast
   */
  toastMessages: {
    loading: string;
    success: string | ((data: TData) => string);
    error?: string | ((error: unknown) => string);
  };
}

/**
 * A wrapper around useMutation that shows a promise-style toast
 * (loading indicator that transitions to success or error)
 *
 * @example
 * ```tsx
 * const mutation = usePromiseMutation({
 *   mutationFn: (data) => uploadFile(data),
 *   toastMessages: {
 *     loading: 'Uploading file...',
 *     success: 'File uploaded successfully!',
 *     error: 'Failed to upload file',
 *   },
 * });
 * ```
 */
export function usePromiseMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: PromiseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { toastMessages, mutationFn, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    mutationFn: async (variables: TVariables, client) => {
      if (!mutationFn) {
        throw new Error('mutationFn is required');
      }

      // Wrap the mutation in a promise toast
      const promise = mutationFn(variables, client);
      return toast.promise(promise, toastMessages);
    },
  });
}
