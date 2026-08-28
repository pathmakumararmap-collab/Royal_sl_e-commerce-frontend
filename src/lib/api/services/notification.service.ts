import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { PaginatedResponse } from "@/types/common";
import type { AppNotification } from "@/types/notification";

export interface NotificationListResult {
  data: PaginatedResponse<AppNotification> | AppNotification[];
  unread_count: number;
}

export const notificationService = {
  async list(): Promise<NotificationListResult> {
    const { data } = await apiClient.get<NotificationListResult>(
      API_ENDPOINTS.notifications.list
    );
    return data;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.put(API_ENDPOINTS.notifications.read(id));
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put(API_ENDPOINTS.notifications.readAll);
  },
};
