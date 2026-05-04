import { useQuery } from "@tanstack/react-query";

import { getAdminDashboardData } from "../api";

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: ["admin", "dashboard", "overview"],
    queryFn: getAdminDashboardData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
