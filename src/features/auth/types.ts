/**
 * Authentication types matching Backend DTOs
 * Updated to match AUTH_API_README.md specifications
 */

// User entity - matches API response
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  roles: string[];
}

// Login request - matches API spec
export interface LoginRequest {
  emailOrUserName: string;
  password: string;
  returnUrl?: string;
}

// Login response - matches API spec
export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresUtc: string;
  user: User;
  returnUrl?: string;
}

// Register request - matches API spec
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName?: string;
  returnUrl?: string;
}

// Register response - API returns message only, user needs to confirm email
export interface RegisterResponse {
  message: string;
}

// Forgot password request/response
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

// Reset password request/response
export interface ResetPasswordRequest {
  userId: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Confirm email request (query params)
export interface ConfirmEmailRequest {
  userId: string;
  token: string;
  returnUrl?: string;
}

export interface ConfirmEmailResponse {
  message: string;
}

// Refresh token response - matches API spec
export interface RefreshTokenResponse {
  accessToken: string;
  accessTokenExpiresUtc: string;
  user: User;
  returnUrl?: string;
}

// Google login callback data (via postMessage)
export interface GoogleLoginCallbackData {
  token?: string;
  user?: User;
  returnUrl?: string;
  error?: {
    message: string;
  };
}

// Auth state for UI
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth session (for client-side storage)
export interface AuthSession {
  user: User;
  accessToken: string;
  expiresAt: string;
}
