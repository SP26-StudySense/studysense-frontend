import { get } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { PaginatedResponse } from "@/shared/types/api";

import type {
  AdminTransactionDto,
  AdminTransactionsList,
  GetAdminTransactionsParams,
  GetAllAdminTransactionsApiResponse,
  Transaction,
} from "./types";

function isPaginatedResponse<T>(value: unknown): value is PaginatedResponse<T> {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<PaginatedResponse<T>>;

  return (
    Array.isArray(candidate.items) &&
    typeof candidate.pageIndex === "number" &&
    typeof candidate.pageSize === "number" &&
    typeof candidate.totalPages === "number" &&
    typeof candidate.totalCount === "number" &&
    typeof candidate.hasPreviousPage === "boolean" &&
    typeof candidate.hasNextPage === "boolean"
  );
}

function extractTransactionsPage(
  response: GetAllAdminTransactionsApiResponse
): PaginatedResponse<AdminTransactionDto> {
  if (isPaginatedResponse<AdminTransactionDto>(response)) {
    return response;
  }

  const container = response as {
    transactions?: unknown;
    userPayments?: unknown;
    payments?: unknown;
  };

  if (isPaginatedResponse<AdminTransactionDto>(container.transactions)) {
    return container.transactions;
  }

  if (isPaginatedResponse<AdminTransactionDto>(container.userPayments)) {
    return container.userPayments;
  }

  if (isPaginatedResponse<AdminTransactionDto>(container.payments)) {
    return container.payments;
  }

  throw new Error("Unexpected admin transactions response shape.");
}

function normalizeStatus(status?: string | null): string {
  const normalized = (status ?? "").trim().toLowerCase();

  if (normalized === "success") return "Completed";
  if (normalized === "completed") return "Completed";
  if (normalized === "pending") return "Pending";
  if (normalized === "failed") return "Failed";
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelled";

  return status?.trim() || "Unknown";
}

function formatAmount(value: number | string | null | undefined): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 2,
    }).format(value);
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return "-";

    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return formatAmount(parsed);
    }

    return raw;
  }

  return "-";
}

function formatDate(value?: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
}

function toUiTransaction(dto: AdminTransactionDto): Transaction {
  return {
    id: String(dto.id),
    user:
      dto.userName?.trim() ||
      dto.userEmail?.trim() ||
      "Unknown User",
    subscriptionType:
      dto.courseName?.trim() ||
      dto.course?.trim() ||
      dto.subscriptionType?.trim() ||
      "-",
    amount: formatAmount(dto.amount),
    currency: dto.currency?.trim().toUpperCase() || "-",
    status: normalizeStatus(dto.status),
    date: formatDate(dto.paymentDate || dto.createdAt),
  };
}

export async function getAdminTransactions(
  params?: GetAdminTransactionsParams
): Promise<AdminTransactionsList> {
  const response = await get<GetAllAdminTransactionsApiResponse>(
    endpoints.admin.transactions.base,
    {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    }
  );

  const page = extractTransactionsPage(response);

  return {
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    totalPages: page.totalPages,
    totalCount: page.totalCount,
    hasPreviousPage: page.hasPreviousPage,
    hasNextPage: page.hasNextPage,
    items: page.items.map(toUiTransaction),
  };
}
