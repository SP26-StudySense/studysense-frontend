"use client";

import { AdminUsersPage, User } from "@/features/admin/admin-users";

export default function UsersPage() {
  // Mock data
  const users: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Student",
      status: "Active",
      joinDate: "2024-01-15",
      isLocked: false,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Student",
      status: "Active",
      joinDate: "2024-02-20",
      isLocked: false,
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: "Instructor",
      status: "Active",
      joinDate: "2024-01-10",
      isLocked: true,
    },
    {
      id: "4",
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      role: "Student",
      status: "Inactive",
      joinDate: "2024-03-05",
      isLocked: false,
    },
    {
      id: "5",
      name: "David Brown",
      email: "david.brown@example.com",
      role: "Student",
      status: "Active",
      joinDate: "2024-02-28",
      isLocked: false,
    },
  ];

  const handleLockUser = (user: User) => {
    console.log("Lock user:", user);
  };

  const handleUnlockUser = (user: User) => {
    console.log("Unlock user:", user);
  };

  return <AdminUsersPage users={users} onLockUser={handleLockUser} onUnlockUser={handleUnlockUser} />;
}
