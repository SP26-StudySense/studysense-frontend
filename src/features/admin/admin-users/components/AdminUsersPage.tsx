"use client";

import { useState } from "react";
import { Eye, Lock, Plus, Unlock } from "lucide-react";

import { AdminTable, TableColumn } from "../../components";
import type { CreateAdminUserRequest, User } from "../api";
import {
  AdminUsersActionModal,
  type AdminUsersConfirmModalState,
} from "./AdminUsersActionModal";
import { AdminUsersCreateUserModal } from "./AdminUsersCreateUserModal";
import { AdminUsersProfileModal } from "./AdminUsersProfileModal";

interface AdminUsersPageProps {
  users?: User[];
  currentUserId?: string;
  roleOptions?: string[];
  subjectOptions?: Array<{ id: number; name: string }>;
  isSubjectOptionsLoading?: boolean;
  isCreatingUser?: boolean;
  onLockUser?: (user: User) => void;
  onUnlockUser?: (user: User) => void;
  onAssignSubject?: (user: User, subjectIds: number[]) => void;
  onUnassignSubject?: (user: User, subjectId?: number) => void;
  onCreateUser?: (payload: CreateAdminUserRequest) => Promise<void>;
}

function isContentManager(user: User) {
  return user.role
    .split(",")
    .map((role) => role.replace(/\s+/g, "").toLowerCase())
    .includes("contentmanager");
}

function getAssignedSubjectText(user: User): string {
  const assignedSubjects = user.assignedSubjects ?? [];

  if (assignedSubjects.length > 0) {
    return assignedSubjects.map((subject) => subject.subjectName).join(", ");
  }

  return user.assignedSubjectName || (isContentManager(user) ? "Not assigned" : "-");
}

export function AdminUsersPage({
  users = [],
  currentUserId,
  roleOptions = [],
  subjectOptions = [],
  isSubjectOptionsLoading = false,
  isCreatingUser = false,
  onLockUser,
  onUnlockUser,
  onAssignSubject,
  onUnassignSubject,
  onCreateUser,
}: AdminUsersPageProps) {
  const [confirmModal, setConfirmModal] = useState<AdminUsersConfirmModalState>({
    isOpen: false,
    user: null,
    action: "lock",
  });
  const [selectedAssignSubjectIds, setSelectedAssignSubjectIds] = useState<number[]>([]);
  const [selectedUnassignSubjectId, setSelectedUnassignSubjectId] = useState<number | "">("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);

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
    setSelectedAssignSubjectIds([]);
    setConfirmModal({
      isOpen: true,
      user,
      action: "assign",
    });
  };

  const handleUnassignClick = (user: User) => {
    const assignedSubjectIds = (user.assignedSubjects ?? []).map((subject) => subject.subjectId);
    const fallbackSubjectId = assignedSubjectIds[0] ?? user.assignedSubjectId ?? "";

    setSelectedUnassignSubjectId(fallbackSubjectId);
    setConfirmModal({
      isOpen: true,
      user,
      action: "unassign",
    });
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (isCreatingUser) {
      return;
    }

    setIsCreateModalOpen(false);
  };

  const handleCloseProfileModal = () => {
    setProfileUser(null);
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
      selectedAssignSubjectIds.length > 0
    ) {
      onAssignSubject(confirmModal.user, selectedAssignSubjectIds);
    } else if (
      confirmModal.action === "unassign" &&
      onUnassignSubject &&
      typeof selectedUnassignSubjectId === "number" &&
      Number.isFinite(selectedUnassignSubjectId) &&
      selectedUnassignSubjectId > 0
    ) {
      onUnassignSubject(confirmModal.user, selectedUnassignSubjectId);
    }

    setConfirmModal({ isOpen: false, user: null, action: "lock" });
    setSelectedAssignSubjectIds([]);
    setSelectedUnassignSubjectId("");
  };

  const handleCloseActionModal = () => {
    setConfirmModal({ isOpen: false, user: null, action: "lock" });
    setSelectedAssignSubjectIds([]);
    setSelectedUnassignSubjectId("");
  };

  const toggleAssignSubject = (subjectId: number, checked: boolean) => {
    setSelectedAssignSubjectIds((prev) => {
      if (checked) {
        return [...prev, subjectId];
      }

      return prev.filter((id) => id !== subjectId);
    });
  };

  const columns: TableColumn<User>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "assignedSubjectName",
      label: "Assigned Subject",
      render: (user: User) => (
        <span className="text-sm text-neutral-700">{getAssignedSubjectText(user)}</span>
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
    const canUnassignSubject =
      canAssignSubject &&
      (((user.assignedSubjects ?? []).length > 0) || !!user.assignedSubjectId);
    const disableAssign = isSubjectOptionsLoading || subjectOptions.length === 0;
    const viewProfileButton = (
      <button
        onClick={() => setProfileUser(user)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-blue-700 transition-all hover:bg-blue-50"
        title="View profile"
      >
        <Eye className="h-4 w-4" />
        View Profile
      </button>
    );

    if (isLocked) {
      return (
        <div className="flex items-center gap-2">
          {viewProfileButton}
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
        {viewProfileButton}
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

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">
              Manage all registered users
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create User
          </button>
        </div>

        <AdminTable
          columns={columns}
          data={users}
          renderActions={renderActions}
        />
      </div>

      <AdminUsersActionModal
        confirmModal={confirmModal}
        subjectOptions={subjectOptions}
        isSubjectOptionsLoading={isSubjectOptionsLoading}
        selectedAssignSubjectIds={selectedAssignSubjectIds}
        selectedUnassignSubjectId={selectedUnassignSubjectId}
        onToggleAssignSubject={toggleAssignSubject}
        onSelectUnassignSubject={setSelectedUnassignSubjectId}
        onClose={handleCloseActionModal}
        onConfirm={handleConfirm}
      />

      <AdminUsersCreateUserModal
        isOpen={isCreateModalOpen}
        roleOptions={roleOptions}
        isCreatingUser={isCreatingUser}
        onClose={handleCloseCreateModal}
        onCreateUser={onCreateUser}
      />

      <AdminUsersProfileModal
        profileUser={profileUser}
        onClose={handleCloseProfileModal}
      />
    </>
  );
}
