import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";

import { getAdminTransactions } from "./api";
import type { GetAdminTransactionsParams } from "./types";

export function useAdminTransactionsQuery(params: GetAdminTransactionsParams) {
  return useQuery({
    queryKey: [
      ...queryKeys.admin.transactions.lists(),
      params.pageIndex ?? 1,
      params.pageSize ?? 20,
    ],
    queryFn: () => getAdminTransactions(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
