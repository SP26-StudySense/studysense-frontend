"use client";

import { AdminTable, TableColumn } from "../components";
import { Transaction } from "./types";

interface AdminTransactionsPageProps {
  transactions?: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export function AdminTransactionsPage({
  transactions = [],
  onEdit,
  onDelete,
}: AdminTransactionsPageProps) {
  const statusColors = {
    Completed: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Failed: "bg-red-100 text-red-700",
  };

  const columns: TableColumn<Transaction>[] = [
    { key: "id", label: "Transaction ID" },
    { key: "user", label: "User" },
    { key: "course", label: "Course" },
    { key: "amount", label: "Amount" },
    {
      key: "status",
      label: "Status",
      render: (transaction: Transaction) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            statusColors[transaction.status as keyof typeof statusColors]
          }`}
        >
          {transaction.status}
        </span>
      ),
    },
    { key: "date", label: "Date" },
    { key: "paymentMethod", label: "Payment Method" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">
            View all payment transactions
          </p>
        </div>
        <button className="rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#ff9bf5] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md">
          Export
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={transactions}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
