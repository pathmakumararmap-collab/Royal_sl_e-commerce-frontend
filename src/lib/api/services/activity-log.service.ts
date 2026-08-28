import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { PaginatedResponse } from "@/types/common";
import type { ActivityLog } from "@/types/activity-log";

export interface ActivityLogFilters {
  subject_type?: string;
  causer_id?: number;
  page?: number;
  per_page?: number;
}

export const activityLogService = {
  async list(
    filters: ActivityLogFilters = {}
  ): Promise<PaginatedResponse<ActivityLog>> {
    const { data } = await apiClient.get<PaginatedResponse<ActivityLog>>(
      API_ENDPOINTS.admin.activityLogs,
      { params: filters }
    );
    return data;
  },
};
