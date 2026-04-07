"use client";

import { FormEvent, useState } from "react";
import { Eye, Lock, Plus, Unlock, X } from "lucide-react";
import { AdminTable, TableColumn } from "../../components";
import { ConfirmationModal } from "@/shared/ui";
import type { CreateAdminUserRequest, User } from "../api";

type CreateUserFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  roleName: string;
};

type CreateUserField = keyof CreateUserFormState;
type CreateUserFormErrors = Partial<Record<CreateUserField, string>>;

const emptyCreateUserForm: CreateUserFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  roleName: "",
};

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
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: User | null;
    action: "lock" | "unlock" | "assign" | "unassign";
  }>({
    isOpen: false,
    user: null,
    action: "lock",
  });
  const [selectedAssignSubjectIds, setSelectedAssignSubjectIds] = useState<number[]>([]);
  const [selectedUnassignSubjectId, setSelectedUnassignSubjectId] = useState<number | "">("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserFormState>(emptyCreateUserForm);
  const [createFormErrors, setCreateFormErrors] = useState<CreateUserFormErrors>({});

  const validateCreateUserForm = () => {
    const errors: CreateUserFormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!createForm.firstName.trim()) {
      errors.firstName = "First name is required.";
    }

    if (!createForm.email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(createForm.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!createForm.password) {
      errors.password = "Password is required.";
    } else if (createForm.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!createForm.confirmPassword) {
      errors.confirmPassword = "Please confirm the password.";
    } else if (createForm.confirmPassword !== createForm.password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!createForm.roleName.trim()) {
      errors.roleName = "Role is required.";
    }

    return errors;
  };

  const handleOpenCreateModal = () => {
    const defaultRole = roleOptions.includes("User")
      ? "User"
      : roleOptions[0] ?? "";

    setCreateForm({
      ...emptyCreateUserForm,
      roleName: defaultRole,
    });
    setCreateFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (isCreatingUser) return;

    setIsCreateModalOpen(false);
    setCreateForm(emptyCreateUserForm);
    setCreateFormErrors({});
  };

  const handleCreateInputChange = (field: CreateUserField, value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (createFormErrors[field]) {
      setCreateFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onCreateUser) return;

    const validationErrors = validateCreateUserForm();
    if (Object.keys(validationErrors).length > 0) {
      setCreateFormErrors(validationErrors);
      return;
    }

    try {
      await onCreateUser({
        email: createForm.email.trim(),
        password: createForm.password,
        confirmPassword: createForm.confirmPassword,
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim() || undefined,
        roleName: createForm.roleName.trim(),
      });

      setIsCreateModalOpen(false);
      setCreateForm(emptyCreateUserForm);
      setCreateFormErrors({});
    } catch {
      // Toast is handled by mutation.
    }
  };

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

  const handleViewProfile = (user: User) => {
    setProfileUser(user);
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

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, user: null, action: "lock" });
    setSelectedAssignSubjectIds([]);
    setSelectedUnassignSubjectId("");
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
          {(user.assignedSubjects ?? []).length > 0
            ? user.assignedSubjects?.map((subject) => subject.subjectName).join(", ")
            : user.assignedSubjectName || (isContentManager(user) ? "Not assigned" : "-")}
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
    const canUnassignSubject =
      canAssignSubject &&
      (((user.assignedSubjects ?? []).length > 0) || !!user.assignedSubjectId);
    const disableAssign = isSubjectOptionsLoading || subjectOptions.length === 0;
    const viewProfileButton = (
      <button
        onClick={() => handleViewProfile(user)}
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

  const getModalContent = () => {
    if (!confirmModal.user) return { title: "", description: "" };

    const isLock = confirmModal.action === "lock";
    const isAssign = confirmModal.action === "assign";
    const isUnassign = confirmModal.action === "unassign";
    const { name, email } = confirmModal.user;

    if (isAssign) {
      const assignedSubjectIds = new Set(
        (confirmModal.user.assignedSubjects ?? []).map((subject) => subject.subjectId)
      );

      const availableSubjects = subjectOptions.filter(
        (subject) => !assignedSubjectIds.has(subject.id)
      );

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
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-neutral-200 p-2">
              {isSubjectOptionsLoading ? (
                <p className="text-sm text-neutral-500">Loading subjects...</p>
              ) : availableSubjects.length === 0 ? (
                <p className="text-sm text-neutral-500">All active subjects are already assigned.</p>
              ) : (
                availableSubjects.map((subject) => {
                  const isChecked = selectedAssignSubjectIds.includes(subject.id);

                  return (
                    <label key={subject.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(event) => {
                          setSelectedAssignSubjectIds((prev) => {
                            if (event.target.checked) {
                              return [...prev, subject.id];
                            }

                            return prev.filter((id) => id !== subject.id);
                          });
                        }}
                        className="h-4 w-4 rounded border-neutral-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-neutral-700">{subject.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        ),
        confirmText: "Assign Selected",
        variant: "default" as const,
      };
    }

    if (isUnassign) {
      const assignedSubjects = (confirmModal.user.assignedSubjects ?? []).length > 0
        ? confirmModal.user.assignedSubjects ?? []
        : confirmModal.user.assignedSubjectId && confirmModal.user.assignedSubjectName
          ? [{
              subjectId: confirmModal.user.assignedSubjectId,
              subjectName: confirmModal.user.assignedSubjectName,
            }]
          : [];

      return {
        title: "Unassign Subject",
        description: (
          <div>
            <p className="mb-3">Choose a subject to remove from:</p>
            <div className="rounded-lg bg-neutral-100 p-3">
              <p className="font-medium text-neutral-900">{name}</p>
              <p className="text-sm text-neutral-600">{email}</p>
            </div>
            <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Assigned Subject
            </label>
            <select
              value={selectedUnassignSubjectId}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedUnassignSubjectId(value ? Number(value) : "");
              }}
              disabled={assignedSubjects.length === 0}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-cyan-400"
            >
              {assignedSubjects.length === 0 ? (
                <option value="">No assigned subject</option>
              ) : (
                assignedSubjects.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    {subject.subjectName}
                  </option>
                ))
              )}
            </select>
          </div>
        ),
        confirmText: "Unassign Subject",
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

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        title={modalContent.title}
        description={modalContent.description}
        confirmText={modalContent.confirmText}
        variant={modalContent.variant}
      />

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={handleCloseCreateModal}
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200/60 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Create User</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Create a new account for the system.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                disabled={isCreatingUser}
                className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={createForm.firstName}
                    onChange={(event) =>
                      handleCreateInputChange("firstName", event.target.value)
                    }
                    placeholder="Enter first name"
                    className="w-full rounded-xl border border-cyan-100 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition-colors focus:border-cyan-400"
                  />
                  {createFormErrors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{createFormErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={createForm.lastName}
                    onChange={(event) =>
                      handleCreateInputChange("lastName", event.target.value)
                    }
                    placeholder="Enter last name (optional)"
                    className="w-full rounded-xl border border-cyan-100 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition-colors focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Email
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(event) =>
                    handleCreateInputChange("email", event.target.value)
                  }
                  placeholder="Enter email address"
                  className="w-full rounded-xl border border-cyan-100 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition-colors focus:border-cyan-400"
                />
                {createFormErrors.email && (
                  <p className="mt-1 text-xs text-red-600">{createFormErrors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  Role
                </label>
                <select
                  value={createForm.roleName}
                  onChange={(event) =>
                    handleCreateInputChange("roleName", event.target.value)
                  }
                  className="w-full rounded-xl border border-cyan-100 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition-colors focus:border-cyan-400"
                >
                  <option value="">Select role</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {createFormErrors.roleName && (
                  <p className="mt-1 text-xs text-red-600">{createFormErrors.roleName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
                    Password
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(event) =>
                      handleCreateInputChange("password", event.target.value)
                    }
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-cyan-100 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition-colors focus:border-cyan-400"
                  />
                  {createFormErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{createFormErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={createForm.confirmPassword}
                    onChange={(event) =>
                      handleCreateInputChange("confirmPassword", event.target.value)
                    }
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-cyan-100 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition-colors focus:border-cyan-400"
                  />
                  {createFormErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{createFormErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <p className="rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs text-cyan-800">
                The selected role will be assigned immediately when the account is created.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  disabled={isCreatingUser}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="rounded-xl bg-gradient-to-r from-[#fec5fb] to-[#00bae2] px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreatingUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {profileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={handleCloseProfileModal}
          />

          <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-200/60 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">User Profile</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Profile details for the selected user account.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseProfileModal}
                className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#fec5fb] to-[#00bae2] text-lg font-bold text-neutral-900">
                  {(profileUser.name || profileUser.email || "U").trim().charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-neutral-900">
                    {profileUser.name}
                  </p>
                  <p className="truncate text-sm text-neutral-600">{profileUser.email}</p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    profileUser.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {profileUser.status}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-neutral-200/70 bg-white p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  User ID
                </p>
                <p className="break-all text-sm font-medium text-neutral-900">{profileUser.id}</p>
              </div>

              <div className="rounded-xl border border-neutral-200/70 bg-white p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Username
                </p>
                <p className="text-sm font-medium text-neutral-900">{profileUser.userName || "-"}</p>
              </div>

              <div className="rounded-xl border border-neutral-200/70 bg-white p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  First Name
                </p>
                <p className="text-sm font-medium text-neutral-900">{profileUser.firstName || "-"}</p>
              </div>

              <div className="rounded-xl border border-neutral-200/70 bg-white p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Last Name
                </p>
                <p className="text-sm font-medium text-neutral-900">{profileUser.lastName || "-"}</p>
              </div>

              <div className="rounded-xl border border-neutral-200/70 bg-white p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Phone Number
                </p>
                <p className="text-sm font-medium text-neutral-900">{profileUser.phoneNumber || "-"}</p>
              </div>

              <div className="rounded-xl border border-neutral-200/70 bg-white p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Assigned Subject
                </p>
                <p className="text-sm font-medium text-neutral-900">
                  {profileUser.assignedSubjectName || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-200/70 bg-white p-4 md:col-span-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Roles
                </p>
                <div className="flex flex-wrap gap-2">
                  {(profileUser.roleNames && profileUser.roleNames.length > 0
                    ? profileUser.roleNames
                    : profileUser.role
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean)
                  ).map((roleName) => (
                    <span
                      key={roleName}
                      className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-medium text-cyan-800"
                    >
                      {roleName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleCloseProfileModal}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
