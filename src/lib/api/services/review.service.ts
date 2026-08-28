import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { buildFormData } from "@/lib/api/form-data";
import type { ApiResource, PaginatedResponse } from "@/types/common";
import type { ProductReview } from "@/types/catalog";

export interface ReviewInput {
  rating: number;
  title?: string;
  comment?: string;
  images?: File[];
}

export const reviewService = {
  async list(productId: number, page = 1): Promise<PaginatedResponse<ProductReview>> {
    const { data } = await apiClient.get<PaginatedResponse<ProductReview>>(
      API_ENDPOINTS.catalog.reviews(productId),
      { params: { page } }
    );
    return data;
  },

  async mine(productId: number): Promise<ProductReview | null> {
    const { data } = await apiClient.get<ApiResource<ProductReview | null>>(
      API_ENDPOINTS.catalog.myReview(productId)
    );
    return data.data;
  },

  async submit(productId: number, input: ReviewInput): Promise<{ data: ProductReview; message: string }> {
    if (input.images?.length) {
      const formData = buildFormData(input);
      const { data } = await apiClient.post<{ data: ProductReview; message: string }>(
        API_ENDPOINTS.catalog.reviews(productId),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    }

    const { data } = await apiClient.post<{ data: ProductReview; message: string }>(
      API_ENDPOINTS.catalog.reviews(productId),
      input
    );
    return data;
  },
};
