"use client";

import { useQuery } from "@tanstack/react-query";

import { activityLogService, type ActivityLogFilters } from "@/lib/api/services/activity-log.service";
import { queryKeys } from "@/lib/query-keys";

export function useActivityLogs(filters: ActivityLogFilters = {}) {
  return useQuery({
    queryKey: queryKeys.activityLogs.list(filters),
    queryFn: () => activityLogService.list(filters),
    placeholderData: (previousData) => previousData,
  });
}
