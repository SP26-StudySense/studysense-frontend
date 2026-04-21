"use client";

import { AdminTable, AdminTableSkeleton, TableColumn } from "../../components";
import type { Transaction } from "../api";

interface AdminTransactionsPageProps {
  transactions?: Transaction[];
  isLoading?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function AdminTransactionsPage({
  transactions = [],
  isLoading = false,
  onEdit,
  onDelete,
}: AdminTransactionsPageProps) {
  const statusColors: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-neutral-200 text-neutral-700",
    canceled: "bg-neutral-200 text-neutral-700",
  };

  const columns: TableColumn<Transaction>[] = [
    { key: "user", label: "User" },
    { key: "subscriptionType", label: "SubscriptionType" },
    { key: "amount", label: "Amount" },
    { key: "currency", label: "Currency" },
    {
      key: "status",
      label: "Status",
      render: (transaction: Transaction) => (
        // Keep unknown statuses readable when backend introduces new values.
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            statusColors[transaction.status.trim().toLowerCase()] ||
            "bg-neutral-100 text-neutral-700"
          }`}
        >
          {transaction.status}
        </span>
      ),
    },
    { key: "date", label: "Date" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <div>
          <p className="text-sm text-neutral-600">
            View all payment transactions
          </p>
        </div>
      </div>

      {isLoading ? (
        <AdminTableSkeleton columns={columns.length} rows={8} />
      ) : (
        <AdminTable
          columns={columns}
          data={transactions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
