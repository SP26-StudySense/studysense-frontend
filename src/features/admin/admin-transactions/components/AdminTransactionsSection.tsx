"use client";

import { useAdminTransactionsManager } from "../hooks";
import { AdminTransactionsPage } from "./AdminTransactionsPage";

export function AdminTransactionsSection() {
  const {
    transactions,
    pagination,
    isLoading,
    isFetching,
    error,
    errorMessage,
    goToPreviousPage,
    goToNextPage,
  } = useAdminTransactionsManager();

  const isTableLoading = isLoading || isFetching;

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : (
        <AdminTransactionsPage
          transactions={transactions}
          isLoading={isTableLoading}
        />
      )}

      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
        <div>
          Total: <span className="font-medium">{pagination.totalCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousPage}
            disabled={!pagination.hasPreviousPage || isTableLoading}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.pageIndex} / {pagination.totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={!pagination.hasNextPage || isTableLoading}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
