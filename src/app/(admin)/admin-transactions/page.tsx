"use client";

import { AdminTransactionsPage, Transaction } from "@/features/admin/admin-transactions";

export default function AdminTransactionsRoute() {
  // Mock data
  const transactions: Transaction[] = [
    {
      id: "TXN-001",
      user: "John Doe",
      course: "Advanced TypeScript",
      amount: "$299.00",
      status: "Completed",
      date: "2024-03-20",
      paymentMethod: "Credit Card",
    },
    {
      id: "TXN-002",
      user: "Jane Smith",
      course: "React Masterclass",
      amount: "$199.00",
      status: "Completed",
      date: "2024-03-19",
      paymentMethod: "PayPal",
    },
    {
      id: "TXN-003",
      user: "David Brown",
      course: "Next.js Complete Guide",
      amount: "$249.00",
      status: "Pending",
      date: "2024-03-18",
      paymentMethod: "Credit Card",
    },
    {
      id: "TXN-004",
      user: "Sarah Williams",
      course: "Data Structures & Algorithms",
      amount: "$349.00",
      status: "Completed",
      date: "2024-03-17",
      paymentMethod: "Debit Card",
    },
    {
      id: "TXN-005",
      user: "Mike Johnson",
      course: "UI/UX Design Fundamentals",
      amount: "$149.00",
      status: "Failed",
      date: "2024-03-16",
      paymentMethod: "Credit Card",
    },
  ];

  const handleEdit = (transaction: Transaction) => {
    console.log("Edit transaction:", transaction);
  };

  const handleDelete = (transaction: Transaction) => {
    console.log("Delete transaction:", transaction);
  };

  return <AdminTransactionsPage transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />;
}
