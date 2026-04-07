import type { PaginatedResponse } from "@/shared/types/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedSubjectId?: number;
  assignedSubjectName?: string;
  status: string;
  joinDate: string;
  isLocked?: boolean;
}

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

export type LearningSubjectOption = {
  id: number;
  name: string;
};

export type UserManagementUserDto = {
  id: string;
  userName: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  roleNames: string[];
  assignedSubjectId?: number | null;
  assignedSubjectName?: string | null;
};

export type LearningSubjectDto = {
  id: number;
  name: string;
  isActive: boolean;
};

export type GetAllUsersApiResponse = {
  users: PaginatedResponse<UserManagementUserDto>;
};

export type GetAllUserRolesApiResponse = {
  roles: string[];
};

export type GetAllLearningSubjectsApiResponse = {
  subjects: PaginatedResponse<LearningSubjectDto>;
};

export type CreateAdminUserRequest = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName?: string;
  roleName: string;
};

export type CreateAdminUserResponse = {
  message: string;
  userId?: string;
  email?: string;
  roleName?: string;
};
