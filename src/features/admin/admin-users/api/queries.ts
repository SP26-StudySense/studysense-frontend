import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";

import { getAdminUserRoles, getAdminUsers, type GetAdminUsersParams } from "./api";

export function useAdminUsersQuery(params: GetAdminUsersParams) {
  return useQuery({
    queryKey: [
      ...queryKeys.admin.users.lists(),
      params.pageIndex ?? 1,
      params.pageSize ?? 20,
      params.name ?? "",
      params.role ?? "",
    ],
    queryFn: () => getAdminUsers(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function useAdminUserRolesQuery() {
  return useQuery({
    queryKey: [...queryKeys.admin.users.all, "roles"],
    queryFn: getAdminUserRoles,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
