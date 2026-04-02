import { useQuery } from '@tanstack/react-query';

import { get } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { GetUserPaymentsResponse, UserMembershipResponse } from './types';

function normalizePaymentsResponse(raw: unknown): GetUserPaymentsResponse {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const payments = (obj.payments ?? obj.Payments ?? []) as GetUserPaymentsResponse['payments'];
  const totalCountRaw = obj.totalCount ?? obj.TotalCount;
  const pageIndexRaw = obj.pageIndex ?? obj.PageIndex;
  const pageSizeRaw = obj.pageSize ?? obj.PageSize;
  const totalPagesRaw = obj.totalPages ?? obj.TotalPages;
  const safePayments = Array.isArray(payments) ? payments : [];
  const safeTotalCount = typeof totalCountRaw === 'number' ? totalCountRaw : safePayments.length;
  const safePageSize = typeof pageSizeRaw === 'number' && pageSizeRaw > 0 ? pageSizeRaw : 10;

  return {
    payments: safePayments,
    totalCount: safeTotalCount,
    pageIndex: typeof pageIndexRaw === 'number' && pageIndexRaw > 0 ? pageIndexRaw : 1,
    pageSize: safePageSize,
    totalPages:
      typeof totalPagesRaw === 'number' && totalPagesRaw > 0
        ? totalPagesRaw
        : Math.max(1, Math.ceil(safeTotalCount / safePageSize)),
  };
}

function normalizeMembershipResponse(raw: unknown): UserMembershipResponse {
  const obj = (raw ?? {}) as Record<string, unknown>;

  return {
    userId: String(obj.userId ?? obj.UserId ?? ''),
    email: String(obj.email ?? obj.Email ?? ''),
    subscriptionType: (obj.subscriptionType ?? obj.SubscriptionType ?? null) as string | null,
    subscriptionStartDate: (obj.subscriptionStartDate ?? obj.SubscriptionStartDate ?? null) as string | null,
    subscriptionEndDate: (obj.subscriptionEndDate ?? obj.SubscriptionEndDate ?? null) as string | null,
    hasActiveSubscription: Boolean(obj.hasActiveSubscription ?? obj.HasActiveSubscription),
    daysRemaining: Number(obj.daysRemaining ?? obj.DaysRemaining ?? 0),
  };
}

export function useUserPayments(enabled = true, pageIndex = 1, pageSize = 10) {
  return useQuery({
    queryKey: ['membership', 'payments', pageIndex, pageSize],
    queryFn: async () => {
      const raw = await get<unknown>(`${endpoints.payments.userPayments}?pageIndex=${pageIndex}&pageSize=${pageSize}`);
      return normalizePaymentsResponse(raw);
    },
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useUserMembership(enabled = true) {
  return useQuery({
    queryKey: ['membership', 'detail'],
    queryFn: async () => {
      const raw = await get<unknown>(endpoints.users.membership);
      return normalizeMembershipResponse(raw);
    },
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
