"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { AdminTable, TableColumn } from "../components";
import { ConfirmationModal } from "@/shared/ui";
import { User } from "./types";

interface AdminUsersPageProps {
  users?: User[];
  currentUserId?: string;
  subjectOptions?: Array<{ id: number; name: string }>;
  isSubjectOptionsLoading?: boolean;
  onLockUser?: (user: User) => void;
  onUnlockUser?: (user: User) => void;
  onAssignSubject?: (user: User, subjectId: number) => void;
  onUnassignSubject?: (user: User) => void;
}

export function AdminUsersPage({
  users = [],
  currentUserId,
  subjectOptions = [],
  isSubjectOptionsLoading = false,
  onLockUser,
  onUnlockUser,
  onAssignSubject,
  onUnassignSubject,
}: AdminUsersPageProps) {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: User | null;
    action: "lock" | "unlock" | "assign" | "unassign";
  }>({
    isOpen: false,
    user: null,
    action: "lock",
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | "">("");

  const isContentManager = (user: User) =>
    user.role
      .split(",")
      .map((role) => role.replace(/\s+/g, "").toLowerCase())
      .includes("contentmanager");

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

  const handleAssignClick = (user: User) => {
    const fallbackSubjectId = subjectOptions[0]?.id ?? "";
    setSelectedSubjectId(user.assignedSubjectId ?? fallbackSubjectId);
    setConfirmModal({
      isOpen: true,
      user,
      action: "assign",
    });
  };

  const handleUnassignClick = (user: User) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: "unassign",
    });
  };

  const handleConfirm = () => {
    if (!confirmModal.user) return;

    if (confirmModal.action === "lock" && onLockUser) {
      onLockUser(confirmModal.user);
    } else if (confirmModal.action === "unlock" && onUnlockUser) {
      onUnlockUser(confirmModal.user);
    } else if (
      confirmModal.action === "assign" &&
      onAssignSubject &&
      typeof selectedSubjectId === "number" &&
      Number.isFinite(selectedSubjectId) &&
      selectedSubjectId > 0
    ) {
      onAssignSubject(confirmModal.user, selectedSubjectId);
    } else if (confirmModal.action === "unassign" && onUnassignSubject) {
      onUnassignSubject(confirmModal.user);
    }

    setConfirmModal({ isOpen: false, user: null, action: "lock" });
    setSelectedSubjectId("");
  };

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, user: null, action: "lock" });
    setSelectedSubjectId("");
  };

  const columns: TableColumn<User>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "assignedSubjectName",
      label: "Assigned Subject",
      render: (user: User) => (
        <span className="text-sm text-neutral-700">
          {user.assignedSubjectName || (isContentManager(user) ? "Not assigned" : "-")}
        </span>
      ),
    },
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
    const isCurrentUser = !!currentUserId && user.id === currentUserId;
    const canAssignSubject = isContentManager(user);
    const canUnassignSubject = canAssignSubject && !!user.assignedSubjectId;
    const disableAssign = isSubjectOptionsLoading || subjectOptions.length === 0;

    if (isLocked) {
      return (
        <div className="flex items-center gap-2">
          {canUnassignSubject && (
            <button
              onClick={() => handleUnassignClick(user)}
              className="rounded-lg px-3 py-1.5 text-rose-700 transition-all hover:bg-rose-50"
              title="Unassign subject"
            >
              Unassign
            </button>
          )}
          {canAssignSubject && (
            <button
              disabled={disableAssign}
              onClick={() => handleAssignClick(user)}
              className="rounded-lg px-3 py-1.5 text-cyan-700 transition-all hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
              title={disableAssign ? "No active subjects available" : "Assign subject"}
            >
              Assign Subject
            </button>
          )}
          <button
            onClick={() => handleUnlockClick(user)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-green-600 transition-all hover:bg-green-50"
          >
            <Unlock className="h-4 w-4" />
            Unblock
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {canUnassignSubject && (
          <button
            onClick={() => handleUnassignClick(user)}
            className="rounded-lg px-3 py-1.5 text-rose-700 transition-all hover:bg-rose-50"
            title="Unassign subject"
          >
            Unassign
          </button>
        )}
        {canAssignSubject && (
          <button
            disabled={disableAssign}
            onClick={() => handleAssignClick(user)}
            className="rounded-lg px-3 py-1.5 text-cyan-700 transition-all hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            title={disableAssign ? "No active subjects available" : "Assign subject"}
          >
            Assign Subject
          </button>
        )}
        <button
          disabled={isCurrentUser}
          onClick={() => handleLockClick(user)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-amber-600 transition-all hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
          title={isCurrentUser ? "You cannot block your own account" : "Block user"}
        >
          <Lock className="h-4 w-4" />
          Block
        </button>
      </div>
    );
  };

  const getModalContent = () => {
    if (!confirmModal.user) return { title: "", description: "" };

    const isLock = confirmModal.action === "lock";
    const isAssign = confirmModal.action === "assign";
    const isUnassign = confirmModal.action === "unassign";
    const { name, email } = confirmModal.user;

    if (isAssign) {
      return {
        title: "Assign Subject",
        description: (
          <div>
            <p className="mb-3">Assign subject for:</p>
            <div className="mb-3 rounded-lg bg-neutral-100 p-3">
              <p className="font-medium text-neutral-900">{name}</p>
              <p className="text-sm text-neutral-600">{email}</p>
            </div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Learning Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedSubjectId(value ? Number(value) : "");
              }}
              disabled={isSubjectOptionsLoading || subjectOptions.length === 0}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-cyan-400"
            >
              {isSubjectOptionsLoading ? (
                <option value="">Loading subjects...</option>
              ) : subjectOptions.length === 0 ? (
                <option value="">No active subjects</option>
              ) : (
                subjectOptions.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))
              )}
            </select>
          </div>
        ),
        confirmText: "Assign",
        variant: "default" as const,
      };
    }

    if (isUnassign) {
      return {
        title: "Unassign Subject",
        description: (
          <div>
            <p className="mb-3">Remove current subject assignment for:</p>
            <div className="rounded-lg bg-neutral-100 p-3">
              <p className="font-medium text-neutral-900">{name}</p>
              <p className="text-sm text-neutral-600">{email}</p>
              <p className="mt-2 text-xs text-neutral-500">
                Current subject: {confirmModal.user.assignedSubjectName || "-"}
              </p>
            </div>
          </div>
        ),
        confirmText: "Unassign",
        variant: "danger" as const,
      };
    }

    return {
      title: isLock ? "Block User Account" : "Unblock User Account",
      description: (
        <div>
          <p className="mb-3">
            Are you sure you want to {isLock ? "block" : "unblock"} the account
            for:
          </p>
          <div className="rounded-lg bg-neutral-100 p-3">
            <p className="font-medium text-neutral-900">{name}</p>
            <p className="text-sm text-neutral-600">{email}</p>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {isLock
              ? "The user will not be able to access their account until unblocked."
              : "The user will regain access to their account."}
          </p>
        </div>
      ),
      confirmText: isLock ? "Block Account" : "Unblock Account",
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
