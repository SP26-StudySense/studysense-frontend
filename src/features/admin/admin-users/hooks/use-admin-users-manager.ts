import { useCallback, useState } from "react";

import { useCurrentUser } from "@/features/auth/api/queries";
import { toast } from "@/shared/lib";

import {
  useActivateAdminUserMutation,
  useAdminAssignableSubjectsQuery,
  useAdminUserRolesQuery,
  useAdminUsersQuery,
  useAssignSubjectToContentManagerMutation,
  useCreateAdminUserMutation,
  useUnassignSubjectFromContentManagerMutation,
  useDeactivateAdminUserMutation,
  type CreateAdminUserRequest,
  type User,
} from "../api";

interface UseAdminUsersManagerOptions {
  initialPageIndex?: number;
  pageSize?: number;
}

export function useAdminUsersManager(options: UseAdminUsersManagerOptions = {}) {
  const {
    initialPageIndex = 1,
    pageSize = 20,
  } = options;

  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(initialPageIndex);

  const { data: roleOptions = [], isLoading: isRolesLoading } = useAdminUserRolesQuery();
  const { data: subjectOptions = [], isLoading: isSubjectsLoading } =
    useAdminAssignableSubjectsQuery();
  const { data: currentUser } = useCurrentUser({ enabled: true });

  const deactivateUserMutation = useDeactivateAdminUserMutation();
  const activateUserMutation = useActivateAdminUserMutation();
  const assignSubjectMutation = useAssignSubjectToContentManagerMutation();
  const unassignSubjectMutation = useUnassignSubjectFromContentManagerMutation();
  const createUserMutation = useCreateAdminUserMutation();

  const { data, isLoading, error } = useAdminUsersQuery({
    pageIndex,
    pageSize,
    name: searchInput.trim() || undefined,
    role: roleFilter || undefined,
  });

  const users = data?.items ?? [];

  const handleLockUser = useCallback(
    async (user: User) => {
      if (currentUser?.id && user.id === currentUser.id) {
        toast.warning("You cannot block your own account.");
        return;
      }

      await deactivateUserMutation.mutateAsync(user.id);
    },
    [currentUser?.id, deactivateUserMutation]
  );

  const handleUnlockUser = useCallback(
    async (user: User) => {
      await activateUserMutation.mutateAsync(user.id);
    },
    [activateUserMutation]
  );

  const handleAssignSubject = useCallback(
    async (user: User, subjectIds: number[]) => {
      if (subjectIds.length === 0) {
        return;
      }

      await Promise.all(
        subjectIds.map((subjectId) =>
          assignSubjectMutation.mutateAsync({ userId: user.id, subjectId })
        )
      );
    },
    [assignSubjectMutation]
  );

  const handleUnassignSubject = useCallback(
    async (user: User, subjectId?: number) => {
      await unassignSubjectMutation.mutateAsync({ userId: user.id, subjectId });
    },
    [unassignSubjectMutation]
  );

  const handleCreateUser = useCallback(
    async (payload: CreateAdminUserRequest) => {
      await createUserMutation.mutateAsync(payload);
    },
    [createUserMutation]
  );

  const onRoleFilterChange = useCallback((value: string) => {
    setRoleFilter(value);
    setPageIndex(1);
  }, []);

  const onSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
    setPageIndex(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setRoleFilter("");
    setPageIndex(1);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPageIndex((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageIndex((prev) => prev + 1);
  }, []);

  const errorMessage = error instanceof Error ? error.message : "Failed to load users";

  return {
    users,
    currentUserId: currentUser?.id,
    roleOptions,
    subjectOptions,
    isRolesLoading,
    isSubjectsLoading,
    searchInput,
    roleFilter,
    isLoading,
    error,
    errorMessage,
    pagination: {
      pageIndex: data?.pageIndex ?? 1,
      totalPages: Math.max(1, data?.totalPages ?? 1),
      totalCount: data?.totalCount ?? 0,
      hasPreviousPage: data?.hasPreviousPage ?? false,
      hasNextPage: data?.hasNextPage ?? false,
    },
    isMutating:
      deactivateUserMutation.isPending ||
      activateUserMutation.isPending ||
      assignSubjectMutation.isPending ||
      unassignSubjectMutation.isPending ||
      createUserMutation.isPending,
    isCreatingUser: createUserMutation.isPending,
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
  };
}
