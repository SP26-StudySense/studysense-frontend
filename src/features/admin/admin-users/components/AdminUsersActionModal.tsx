"use client";

import type { ReactNode } from "react";

import { ConfirmationModal } from "@/shared/ui";

import type { User } from "../api";

export type AdminUserAction = "lock" | "unlock" | "assign" | "unassign";

export type AdminUsersConfirmModalState = {
  isOpen: boolean;
  user: User | null;
  action: AdminUserAction;
};

interface AdminUsersActionModalProps {
  confirmModal: AdminUsersConfirmModalState;
  subjectOptions: Array<{ id: number; name: string }>;
  isSubjectOptionsLoading: boolean;
  selectedAssignSubjectIds: number[];
  selectedUnassignSubjectId: number | "";
  onToggleAssignSubject: (subjectId: number, checked: boolean) => void;
  onSelectUnassignSubject: (subjectId: number | "") => void;
  onClose: () => void;
  onConfirm: () => void;
}

function getAssignedSubjects(user: User): Array<{ subjectId: number; subjectName: string }> {
  if ((user.assignedSubjects ?? []).length > 0) {
    return user.assignedSubjects ?? [];
  }

  if (user.assignedSubjectId && user.assignedSubjectName) {
    return [
      {
        subjectId: user.assignedSubjectId,
        subjectName: user.assignedSubjectName,
      },
    ];
  }

  return [];
}

export function AdminUsersActionModal({
  confirmModal,
  subjectOptions,
  isSubjectOptionsLoading,
  selectedAssignSubjectIds,
  selectedUnassignSubjectId,
  onToggleAssignSubject,
  onSelectUnassignSubject,
  onClose,
  onConfirm,
}: AdminUsersActionModalProps) {
  const modalContent = (() => {
    if (!confirmModal.user) {
      return {
        title: "",
        description: "",
        confirmText: "Confirm",
        variant: "default" as const,
      };
    }

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
                    <label
                      key={subject.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-50"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(event) => onToggleAssignSubject(subject.id, event.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-neutral-700">{subject.name}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        ) as ReactNode,
        confirmText: "Assign Selected",
        variant: "default" as const,
      };
    }

    if (isUnassign) {
      const assignedSubjects = getAssignedSubjects(confirmModal.user);

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
                onSelectUnassignSubject(value ? Number(value) : "");
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
        ) as ReactNode,
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
      ) as ReactNode,
      confirmText: isLock ? "Block Account" : "Unblock Account",
      variant: "default" as const,
    };
  })();

  return (
    <ConfirmationModal
      isOpen={confirmModal.isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={modalContent.title}
      description={modalContent.description}
      confirmText={modalContent.confirmText}
      variant={modalContent.variant}
    />
  );
}
