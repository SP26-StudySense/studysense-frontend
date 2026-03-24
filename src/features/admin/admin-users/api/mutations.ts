import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";
import { toast } from "@/shared/lib";

import { activateAdminUser, deactivateAdminUser } from "./api";

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
