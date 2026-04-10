import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";
import { toast } from "@/shared/lib";

import {
  activateAdminUser,
  assignSubjectToContentManager,
  createAdminUser,
  deactivateAdminUser,
  unassignSingleSubjectFromContentManager,
  unassignSubjectFromContentManager,
} from "./api";
import type { CreateAdminUserRequest } from "./types";

export function useDeactivateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      toast.success("User has been blocked.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to block user.");
    },
  });
}

export function useActivateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => activateAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      toast.success("User has been unblocked.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unblock user.");
    },
  });
}

export function useAssignSubjectToContentManagerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, subjectId }: { userId: string; subjectId: number }) =>
      assignSubjectToContentManager(userId, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      toast.success("Subject assignment has been updated.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign subject.");
    },
  });
}

export function useUnassignSubjectFromContentManagerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, subjectId }: { userId: string; subjectId?: number }) =>
      typeof subjectId === "number"
        ? unassignSingleSubjectFromContentManager(userId, subjectId)
        : unassignSubjectFromContentManager(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      toast.success("Subject assignment has been removed.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unassign subject.");
    },
  });
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminUserRequest) => createAdminUser(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      toast.success(response.message || "User account created successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user account.");
    },
  });
}
