"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

import { AdminTableSkeleton } from "../../components";
import { useAdminUsersManager } from "../hooks";
import { AdminUsersPage } from "./AdminUsersPage";

export function AdminUsersSection() {
  const {
    users,
    currentUserId,
    roleOptions,
    subjectOptions,
    isRolesLoading,
    isSubjectsLoading,
    searchInput,
    roleFilter,
    isLoading,
    error,
    errorMessage,
    pagination,
    isMutating,
    isCreatingUser,
    onRoleFilterChange,
    onSearchInputChange,
    clearFilters,
    goToPreviousPage,
    goToNextPage,
    handleLockUser,
    handleUnlockUser,
    handleAssignSubject,
    handleUnassignSubject,
    handleCreateUser,
  } = useAdminUsersManager();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-sky-50 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-800">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => onSearchInputChange(event.target.value)}
                placeholder="Name or email"
                className="w-full rounded-xl border border-cyan-100 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-700 outline-none transition-colors focus:border-cyan-400"
              />
            </div>
          </div>
          <div className="lg:col-span-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-600">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(event) => onRoleFilterChange(event.target.value)}
              disabled={isRolesLoading}
              className="w-full rounded-xl border border-cyan-100 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition-colors focus:border-cyan-400"
            >
              <option value="">All roles</option>
              {isRolesLoading && <option value="">Loading roles...</option>}
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <button
              onClick={clearFilters}
              disabled={isMutating}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : isLoading && users.length === 0 ? (
        <AdminTableSkeleton columns={7} rows={8} />
      ) : (
        <AdminUsersPage
          users={users}
          currentUserId={currentUserId}
          roleOptions={roleOptions}
          subjectOptions={subjectOptions}
          isSubjectOptionsLoading={isSubjectsLoading}
          onLockUser={handleLockUser}
          onUnlockUser={handleUnlockUser}
          onAssignSubject={handleAssignSubject}
          onUnassignSubject={handleUnassignSubject}
          onCreateUser={handleCreateUser}
          isCreatingUser={isCreatingUser}
        />
      )}

      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
        <div>
          Total: <span className="font-medium">{pagination.totalCount}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousPage}
            disabled={!pagination.hasPreviousPage}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.pageIndex} / {pagination.totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={!pagination.hasNextPage}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
