/**
 * Toast notification utilities
 * Wrapper around Sonner for consistent toast notifications
 */

import { toast as sonnerToast, ExternalToast } from 'sonner';

import { ApiException } from '@/shared/api/errors';

type ToastOptions = ExternalToast;

/**
 * Show a success toast notification
 */
export function showSuccess(title: string, options?: ToastOptions): void {
  sonnerToast.success(title, options);
}

/**
 * Show an error toast notification
 */
export function showError(title: string, options?: ToastOptions): void {
  sonnerToast.error(title, options);
}

/**
 * Show an info toast notification
 */
export function showInfo(title: string, options?: ToastOptions): void {
  sonnerToast.info(title, options);
}

/**
 * Show a warning toast notification
 */
export function showWarning(title: string, options?: ToastOptions): void {
  sonnerToast.warning(title, options);
}

/**
 * Show a loading toast notification
 * Returns the toast id for later dismissal or update
 */
export function showLoading(title: string, options?: ToastOptions): string | number {
  return sonnerToast.loading(title, options);
}

/**
 * Dismiss a specific toast or all toasts
 */
export function dismissToast(toastId?: string | number): void {
  sonnerToast.dismiss(toastId);
}

/**
 * Show toast for API errors with proper message extraction
 * Handles ApiException and generic errors
 */
export function showApiError(error: unknown, fallbackMessage?: string): void {
  if (error instanceof ApiException) {
    const description = error.errors.length > 0 ? error.getFirstError() : undefined;
    
    // Avoid showing duplicate message in title and description
    if (description && description !== error.message) {
      sonnerToast.error(error.message, { description });
    } else {
      sonnerToast.error(error.message);
    }
    return;
  }

  if (error instanceof Error) {
    sonnerToast.error(error.message || fallbackMessage || 'An error occurred');
    return;
  }

  sonnerToast.error(fallbackMessage || 'An unexpected error occurred');
}

/**
 * Promise toast - shows loading, then success or error based on promise result
 * Great for mutations and async operations
 */
export async function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error?: string | ((error: unknown) => string);
  }
): Promise<T> {
  sonnerToast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: (err) => {
      if (messages.error) {
        return typeof messages.error === 'function' 
          ? messages.error(err) 
          : messages.error;
      }
      
      if (err instanceof ApiException) {
        return err.message;
      }
      
      if (err instanceof Error) {
        return err.message;
      }
      
      return 'An unexpected error occurred';
    },
  });
  
  return promise;
}

/**
 * Toast object for direct access to all toast methods
 */
export const toast = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  loading: showLoading,
  dismiss: dismissToast,
  apiError: showApiError,
  promise: showPromise,
  
  // Raw sonner toast for advanced usage
  raw: sonnerToast,
};
