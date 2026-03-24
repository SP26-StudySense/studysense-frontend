import { get, put } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";

import type { User } from "../types";
import type { PaginatedResponse } from "@/shared/types/api";

type GetAllUsersApiResponse = {
  users: PaginatedResponse<UserManagementUserDto>;
};

type GetAllUserRolesApiResponse = {
  roles: string[];
};

export type GetAdminUsersParams = {
  pageIndex?: number;
  pageSize?: number;
  name?: string;
  role?: string;
};

export type AdminUsersList = {
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: User[];
};

type UserManagementUserDto = {
  id: string;
  userName: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  roleNames: string[];
};

function toUiUser(user: UserManagementUserDto): User {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const role = user.roleNames.length > 0 ? user.roleNames.join(", ") : "No Role";

  return {
    id: user.id,
    name: fullName || user.userName || user.email || "Unknown User",
    email: user.email || "-",
    role,
    status: user.isActive ? "Active" : "Inactive",
    joinDate: "-",
    isLocked: !user.isActive,
  };
}

export async function getAdminUsers(params?: GetAdminUsersParams): Promise<AdminUsersList> {
  const response = await get<GetAllUsersApiResponse>(endpoints.admin.users.base, {
    params: {
      pageIndex: params?.pageIndex ?? 1,
      pageSize: params?.pageSize ?? 20,
      name: params?.name,
      role: params?.role,
    },
  });

  return {
    pageIndex: response.users.pageIndex,
    pageSize: response.users.pageSize,
    totalPages: response.users.totalPages,
    totalCount: response.users.totalCount,
    hasPreviousPage: response.users.hasPreviousPage,
    hasNextPage: response.users.hasNextPage,
    items: response.users.items.map(toUiUser),
  };
}

export async function getAdminUserRoles(): Promise<string[]> {
  const response = await get<GetAllUserRolesApiResponse>(endpoints.admin.users.roles);
  return response.roles;
}

export async function deactivateAdminUser(userId: string): Promise<void> {
  await put<void, { id: string }>(endpoints.admin.users.deactivate(userId), { id: userId });
}

export async function activateAdminUser(userId: string): Promise<void> {
  await put<void, { id: string }>(endpoints.admin.users.activate(userId), { id: userId });
}
