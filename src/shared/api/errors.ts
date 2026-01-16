/**
 * API Error handling utilities
 */

import type { ApiError } from '@/shared/types';

// Custom API Error class
export class ApiException extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly errors: ApiError[];
  public readonly timestamp: string;

  constructor(
    message: string,
    status: number,
    code: string = 'UNKNOWN_ERROR',
    errors: ApiError[] = []
  ) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiException);
    }
  }

  // Check if error is a specific type
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isValidationError(): boolean {
    return this.status === 400 || this.status === 422;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  // Get field-specific errors for forms
  getFieldErrors(): Record<string, string> {
    return this.errors.reduce(
      (acc, error) => {
        if (error.field) {
          acc[error.field] = error.message;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }

  // Get first error message
  getFirstError(): string {
    return this.errors[0]?.message || this.message;
  }
}

// Error codes
export const ErrorCode = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// User-friendly error messages
export const ErrorMessages: Record<string, string> = {
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.TOKEN_INVALID]: 'Invalid authentication token. Please log in again.',
  [ErrorCode.UNAUTHORIZED]: 'You need to be logged in to access this resource.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource.',
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_INPUT]: 'The provided data is invalid.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.ALREADY_EXISTS]: 'This resource already exists.',
  [ErrorCode.CONFLICT]: 'There was a conflict with the current state.',
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again later.',
  [ErrorCode.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [ErrorCode.TIMEOUT]: 'The request timed out. Please try again.',
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred.',
};

// Get user-friendly message for error code
export function getErrorMessage(code: string): string {
  return ErrorMessages[code] || ErrorMessages[ErrorCode.UNKNOWN_ERROR];
}

// Parse error from API response
export function parseApiError(error: unknown): ApiException {
  // Already an ApiException
  if (error instanceof ApiException) {
    return error;
  }

  // Axios error
  if (isAxiosError(error)) {
    const status = error.response?.status || 0;
    const data = error.response?.data as {
      message?: string;
      code?: string;
      errors?: ApiError[];
    };

    // Network error
    if (!error.response) {
      return new ApiException(
        ErrorMessages[ErrorCode.NETWORK_ERROR],
        0,
        ErrorCode.NETWORK_ERROR
      );
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      return new ApiException(
        ErrorMessages[ErrorCode.TIMEOUT],
        0,
        ErrorCode.TIMEOUT
      );
    }

    // Server responded with error
    const message = data?.message || getErrorMessage(String(status));
    const code = data?.code || mapStatusToErrorCode(status);
    const errors = data?.errors || [];

    return new ApiException(message, status, code, errors);
  }

  // Generic Error
  if (error instanceof Error) {
    return new ApiException(error.message, 0, ErrorCode.UNKNOWN_ERROR);
  }

  // Unknown error
  return new ApiException(
    ErrorMessages[ErrorCode.UNKNOWN_ERROR],
    0,
    ErrorCode.UNKNOWN_ERROR
  );
}

// Map HTTP status to error code
function mapStatusToErrorCode(status: number): ErrorCodeType {
  switch (status) {
    case 400:
      return ErrorCode.VALIDATION_ERROR;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.CONFLICT;
    case 422:
      return ErrorCode.INVALID_INPUT;
    case 500:
      return ErrorCode.INTERNAL_ERROR;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
}

// Type guard for Axios error
interface AxiosErrorLike {
  isAxiosError: boolean;
  response?: {
    status: number;
    data: unknown;
  };
  code?: string;
}

function isAxiosError(error: unknown): error is AxiosErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosErrorLike).isAxiosError === true
  );
}
