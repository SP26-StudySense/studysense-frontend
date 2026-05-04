"use client";

import { X } from "lucide-react";

import type { User } from "../api";

interface AdminUsersProfileModalProps {
  profileUser: User | null;
  onClose: () => void;
}

function getAssignedSubjectText(user: User): string {
  const assignedSubjects = user.assignedSubjects ?? [];

  if (assignedSubjects.length > 0) {
    return assignedSubjects.map((subject) => subject.subjectName).join(", ");
  }

  return user.assignedSubjectName || "-";
}

export function AdminUsersProfileModal({ profileUser, onClose }: AdminUsersProfileModalProps) {
  if (!profileUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
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
            onClick={onClose}
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
              {getAssignedSubjectText(profileUser)}
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
            onClick={onClose}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
