"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

import type { CreateAdminUserRequest } from "../api";

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

interface AdminUsersCreateUserModalProps {
  isOpen: boolean;
  roleOptions: string[];
  isCreatingUser: boolean;
  onClose: () => void;
  onCreateUser?: (payload: CreateAdminUserRequest) => Promise<void>;
}

export function AdminUsersCreateUserModal({
  isOpen,
  roleOptions,
  isCreatingUser,
  onClose,
  onCreateUser,
}: AdminUsersCreateUserModalProps) {
  const [createForm, setCreateForm] = useState<CreateUserFormState>(emptyCreateUserForm);
  const [createFormErrors, setCreateFormErrors] = useState<CreateUserFormErrors>({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const defaultRole = roleOptions.includes("User") ? "User" : roleOptions[0] ?? "";

    setCreateForm({
      ...emptyCreateUserForm,
      roleName: defaultRole,
    });
    setCreateFormErrors({});
  }, [isOpen, roleOptions]);

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

  const handleClose = () => {
    if (isCreatingUser) {
      return;
    }

    onClose();
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onCreateUser) {
      return;
    }

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

      onClose();
    } catch {
      // Toast is handled by mutation.
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={handleClose}
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
            onClick={handleClose}
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
              onClick={handleClose}
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
  );
}
