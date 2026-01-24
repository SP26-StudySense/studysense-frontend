"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { AdminTable, TableColumn } from "../components";
import { ConfirmationModal } from "@/shared/ui";
import { User } from "./types";

interface AdminUsersPageProps {
  users?: User[];
  onLockUser?: (user: User) => void;
  onUnlockUser?: (user: User) => void;
}

export function AdminUsersPage({
  users = [],
  onLockUser,
  onUnlockUser,
}: AdminUsersPageProps) {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: User | null;
    action: "lock" | "unlock";
  }>({
    isOpen: false,
    user: null,
    action: "lock",
  });

  const handleLockClick = (user: User) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: "lock",
    });
  };

  const handleUnlockClick = (user: User) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: "unlock",
    });
  };

  const handleConfirm = () => {
    if (!confirmModal.user) return;

    if (confirmModal.action === "lock" && onLockUser) {
      onLockUser(confirmModal.user);
    } else if (confirmModal.action === "unlock" && onUnlockUser) {
      onUnlockUser(confirmModal.user);
    }

    setConfirmModal({ isOpen: false, user: null, action: "lock" });
  };

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, user: null, action: "lock" });
  };

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

  const renderActions = (user: User) => {
    const isLocked = user.isLocked || false;

    if (isLocked) {
      return (
        <button
          onClick={() => handleUnlockClick(user)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-green-600 transition-all hover:bg-green-50"
        >
          <Unlock className="h-4 w-4" />
          Unlock
        </button>
      );
    }

    return (
      <button
        onClick={() => handleLockClick(user)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-amber-600 transition-all hover:bg-amber-50"
      >
        <Lock className="h-4 w-4" />
        Lock
      </button>
    );
  };

  const getModalContent = () => {
    if (!confirmModal.user) return { title: "", description: "" };

    const isLock = confirmModal.action === "lock";
    const { name, email } = confirmModal.user;

    return {
      title: isLock ? "Lock User Account" : "Unlock User Account",
      description: (
        <div>
          <p className="mb-3">
            Are you sure you want to {isLock ? "lock" : "unlock"} the account
            for:
          </p>
          <div className="rounded-lg bg-neutral-100 p-3">
            <p className="font-medium text-neutral-900">{name}</p>
            <p className="text-sm text-neutral-600">{email}</p>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {isLock
              ? "The user will not be able to access their account until unlocked."
              : "The user will regain access to their account."}
          </p>
        </div>
      ),
      confirmText: isLock ? "Lock Account" : "Unlock Account",
      variant: isLock ? ("default" as const) : ("default" as const),
    };
  };

  const modalContent = getModalContent();

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">
              Manage all registered users
            </p>
          </div>
        </div>

        <AdminTable
          columns={columns}
          data={users}
          renderActions={renderActions}
        />
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        title={modalContent.title}
        description={modalContent.description}
        confirmText={modalContent.confirmText}
        variant={modalContent.variant}
      />
    </>
  );
}
