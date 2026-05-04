import { useCallback, useState } from "react";

import { useAdminTransactionsQuery } from "../api";

interface UseAdminTransactionsManagerOptions {
  initialPageIndex?: number;
  pageSize?: number;
}

export function useAdminTransactionsManager(
  options: UseAdminTransactionsManagerOptions = {}
) {
  const {
    initialPageIndex = 1,
    pageSize = 20,
  } = options;

  const [pageIndex, setPageIndex] = useState(initialPageIndex);

  const { data, isLoading, isFetching, error } = useAdminTransactionsQuery({
    pageIndex,
    pageSize,
  });

  const goToPreviousPage = useCallback(() => {
    setPageIndex((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageIndex((prev) => prev + 1);
  }, []);

  const errorMessage =
    error instanceof Error ? error.message : "Failed to load transactions";

  return {
    transactions: data?.items ?? [],
    pagination: {
      pageIndex: data?.pageIndex ?? pageIndex,
      totalPages: Math.max(1, data?.totalPages ?? 1),
      totalCount: data?.totalCount ?? 0,
      hasPreviousPage: data?.hasPreviousPage ?? false,
      hasNextPage: data?.hasNextPage ?? false,
    },
    isLoading,
    isFetching,
    error,
    errorMessage,
    goToPreviousPage,
    goToNextPage,
  };
}
