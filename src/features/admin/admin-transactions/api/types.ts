import type { PaginatedResponse } from "@/shared/types/api";

export interface Transaction {
  id: string;
  user: string;
  subscriptionType: string;
  amount: string;
  currency: string;
  status: string;
  date: string;
}

export type GetAdminTransactionsParams = {
  pageIndex?: number;
  pageSize?: number;
};

export type AdminTransactionsList = {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: Transaction[];
};

export type AdminTransactionDto = {
  id: string | number;
  userId?: string | number | null;
  userName?: string | null;
  userEmail?: string | null;
  course?: string | null;
  courseName?: string | null;
  subscriptionType?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  status?: string | null;
  paymentDate?: string | null;
  createdAt?: string | null;
  paymentMethod?: string | null;
};

export type GetAllAdminTransactionsApiResponse =
  | {
      transactions?: PaginatedResponse<AdminTransactionDto>;
      userPayments?: PaginatedResponse<AdminTransactionDto>;
      payments?: PaginatedResponse<AdminTransactionDto>;
    }
  | PaginatedResponse<AdminTransactionDto>;
