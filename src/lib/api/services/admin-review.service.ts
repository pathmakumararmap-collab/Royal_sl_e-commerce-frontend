import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { ApiResource, PaginatedResponse } from "@/types/common";
import type { ProductReview } from "@/types/catalog";

export interface AdminReviewFilters {
  status?: "pending" | "approved" | "rejected";
  page?: number;
}

export interface AdminProductReview extends ProductReview {
  product?: { id: number; name: string; slug: string };
}

export const adminReviewService = {
  async list(filters: AdminReviewFilters = {}): Promise<PaginatedResponse<AdminProductReview>> {
    const { data } = await apiClient.get<PaginatedResponse<AdminProductReview>>(
      API_ENDPOINTS.admin.reviews,
      { params: filters }
    );
    return data;
  },

  async approve(id: number): Promise<AdminProductReview> {
    const { data } = await apiClient.put<ApiResource<AdminProductReview>>(
      API_ENDPOINTS.admin.approveReview(id)
    );
    return data.data;
  },

  async reject(id: number): Promise<AdminProductReview> {
    const { data } = await apiClient.put<ApiResource<AdminProductReview>>(
      API_ENDPOINTS.admin.rejectReview(id)
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.admin.review(id));
  },
};
