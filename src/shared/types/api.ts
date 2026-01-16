/**
 * Shared API types that match the Backend DTO structure
 */

// Generic API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ApiError[];
  timestamp: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// API Error structure
export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

// Pagination request params
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Common filter params
export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Combined query params
export interface QueryParams extends PaginationParams, FilterParams {}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request config
export interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  withCredentials?: boolean;
}
