"use client";

import { AdminTable, TableColumn } from "../components";
import { User } from "./types";

interface AdminUsersPageProps {
  users?: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function AdminUsersPage({
  users = [],
  onEdit,
  onDelete,
}: AdminUsersPageProps) {
  const columns: TableColumn<User>[] = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (user: User) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            user.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {user.status}
        </span>
      ),
    },
    { key: "joinDate", label: "Join Date" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">
            Manage all registered users
          </p>
        </div>
        <button className="rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md">
          Add User
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={users}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
