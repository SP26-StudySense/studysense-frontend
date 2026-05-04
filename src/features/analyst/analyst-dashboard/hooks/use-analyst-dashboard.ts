import { useQuery } from "@tanstack/react-query";

import { getAnalystDashboardData } from "../api";

export function useAnalystDashboardQuery() {
  return useQuery({
    queryKey: ["analyst", "dashboard", "overview"],
    queryFn: getAnalystDashboardData,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
