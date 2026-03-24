"use client";

import { useState } from "react";
import { AdminUsersPage, User } from "@/features/admin/admin-users";
import {
  useActivateAdminUserMutation,
  useAdminUserRolesQuery,
  useAdminUsersQuery,
  useDeactivateAdminUserMutation,
} from "@/features/admin/admin-users/api";
import { toast } from "@/shared/lib";

export default function UsersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 20;

  const { data: roleOptions = [], isLoading: isRolesLoading } = useAdminUserRolesQuery();
  const deactivateUserMutation = useDeactivateAdminUserMutation();
  const activateUserMutation = useActivateAdminUserMutation();

  const { data, isLoading, error } = useAdminUsersQuery({
    pageIndex,
    pageSize,
    name: searchInput.trim() || undefined,
    role: roleFilter || undefined,
  });

  const users = data?.items ?? [];

  const handleLockUser = async (user: User) => {
    await deactivateUserMutation.mutateAsync(user.id);
  };

  const handleUnlockUser = async (user: User) => {
    await activateUserMutation.mutateAsync(user.id);
  };

  const onRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPageIndex(1);
  };

  const onSearchInputChange = (value: string) => {
    setSearchInput(value);
    setPageIndex(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setRoleFilter("");
    setPageIndex(1);
  };

  const errorMessage = error instanceof Error ? error.message : "Failed to load users";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search by name or email"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#00bae2]"
          />
          <select
            value={roleFilter}
            onChange={(event) => onRoleFilterChange(event.target.value)}
            disabled={isRolesLoading}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#00bae2]"
          >
            <option value="">All roles</option>
            {isRolesLoading && <option value="">Loading roles...</option>}
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              disabled={deactivateUserMutation.isPending || activateUserMutation.isPending}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : isLoading && !data ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
          Loading users...
        </div>
      ) : (
        <AdminUsersPage users={users} onLockUser={handleLockUser} onUnlockUser={handleUnlockUser} />
      )}

      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
        <div>
          Total: <span className="font-medium">{data?.totalCount ?? 0}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPageIndex((prev) => Math.max(1, prev - 1))}
            disabled={!data?.hasPreviousPage}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {data?.pageIndex ?? 1} / {Math.max(1, data?.totalPages ?? 1)}
          </span>
          <button
            onClick={() => setPageIndex((prev) => prev + 1)}
            disabled={!data?.hasNextPage}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
