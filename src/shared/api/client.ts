/**
 * API Client using Axios
 * Configured with interceptors for authentication and error handling
 * 
 * Note: Token handling is now done by the proxy (src/proxy.ts)
 * The proxy automatically attaches Authorization header and handles token refresh
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import Cookies from 'js-cookie';

import { env } from '@/shared/config';
import type { ApiResponse } from '@/shared/types';
import { ApiException, parseApiError } from './errors';

// Token storage keys (still needed for client-side token management)
const ACCESS_TOKEN_KEY = env.NEXT_PUBLIC_AUTH_TOKEN_KEY;
const REFRESH_TOKEN_KEY = env.NEXT_PUBLIC_AUTH_REFRESH_KEY;

// Create axios instance - now pointing to proxy endpoint
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/proxy', // Proxy will forward to backend
  timeout: env.NEXT_PUBLIC_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - simplified since proxy handles auth
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Proxy will read cookies and add Authorization header
    // No need to manually attach token here
    return config;
  },
  (error) => {
    return Promise.reject(parseApiError(error));
  }
);

// Response interceptor - simplified since proxy handles token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    // Handle 401 - Proxy couldn't refresh token, redirect to login
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      clearTokens();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(parseApiError(error));
  }
);

// Token management functions
export function setTokens(accessToken: string, refreshToken: string): void {
  // Set access token - shorter expiry
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    expires: 1, // 1 day
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  // Set refresh token - longer expiry
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export function clearTokens(): void {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// Generic request functions
export async function get<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, config);
  return response.data.data;
}

export async function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function put<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function patch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function del<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}

// Export the axios instance for direct use if needed
export { apiClient };
