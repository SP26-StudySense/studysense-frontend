import { del, get, post, put } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";

import type {
  AdminUsersList,
  CreateAdminUserRequest,
  CreateAdminUserResponse,
  GetAdminUsersParams,
  GetAllLearningSubjectsApiResponse,
  GetAllUserRolesApiResponse,
  GetAllUsersApiResponse,
  LearningSubjectDto,
  LearningSubjectOption,
  User,
  UserManagementUserDto,
} from "./types";

function toUiUser(user: UserManagementUserDto): User {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const role = user.roleNames.length > 0 ? user.roleNames.join(", ") : "No Role";

  return {
    id: user.id,
    name: fullName || user.userName || user.email || "Unknown User",
    email: user.email || "-",
    userName: user.userName ?? undefined,
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    phoneNumber: user.phoneNumber ?? undefined,
    roleNames: user.roleNames,
    role,
    assignedSubjectId: user.assignedSubjectId ?? undefined,
    assignedSubjectName: user.assignedSubjectName ?? undefined,
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

export async function getAssignableSubjects(): Promise<LearningSubjectOption[]> {
  const pageSize = 100;
  let pageIndex = 1;
  let hasNextPage = true;
  const allSubjects: LearningSubjectDto[] = [];

  while (hasNextPage) {
    const response = await get<GetAllLearningSubjectsApiResponse>("/learning-subjects", {
      params: {
        pageIndex,
        pageSize,
      },
    });

    allSubjects.push(...response.subjects.items);
    hasNextPage = response.subjects.hasNextPage;
    pageIndex += 1;
  }

  return allSubjects
    .filter((subject) => subject.isActive)
    .map((subject) => ({ id: subject.id, name: subject.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function deactivateAdminUser(userId: string): Promise<void> {
  await put<void, { id: string }>(endpoints.admin.users.deactivate(userId), { id: userId });
}

export async function activateAdminUser(userId: string): Promise<void> {
  await put<void, { id: string }>(endpoints.admin.users.activate(userId), { id: userId });
}

export async function assignSubjectToContentManager(
  userId: string,
  subjectId: number
): Promise<void> {
  await put<void, { subjectId: number }>(endpoints.admin.users.assignSubject(userId), {
    subjectId,
  });
}

export async function unassignSubjectFromContentManager(userId: string): Promise<void> {
  await del<void>(endpoints.admin.users.unassignSubject(userId));
}

export async function createAdminUser(
  payload: CreateAdminUserRequest
): Promise<CreateAdminUserResponse> {
  return post<CreateAdminUserResponse, CreateAdminUserRequest>(
    endpoints.admin.users.base,
    payload
  );
}
