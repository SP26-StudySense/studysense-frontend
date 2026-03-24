import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";
import { toast } from "@/shared/lib";

import {
  activateAdminUser,
  assignSubjectToContentManager,
  deactivateAdminUser,
  unassignSubjectFromContentManager,
} from "./api";

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
      toast.success("Subject has been assigned.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign subject.");
    },
  });
}

export function useUnassignSubjectFromContentManagerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unassignSubjectFromContentManager(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      toast.success("Subject has been unassigned.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unassign subject.");
    },
  });
}
