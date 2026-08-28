import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { ApiResource, PaginatedResponse } from "@/types/common";
import type { Coupon, CouponInput } from "@/types/coupon";

export const couponService = {
  async list(page = 1, perPage = 15): Promise<PaginatedResponse<Coupon>> {
    const { data } = await apiClient.get<PaginatedResponse<Coupon>>(
      API_ENDPOINTS.admin.coupons,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async get(id: number): Promise<Coupon> {
    const { data } = await apiClient.get<ApiResource<Coupon>>(
      API_ENDPOINTS.admin.coupon(id)
    );
    return data.data;
  },

  async create(input: CouponInput): Promise<Coupon> {
    const { data } = await apiClient.post<ApiResource<Coupon>>(
      API_ENDPOINTS.admin.coupons,
      input
    );
    return data.data;
  },

  async update(id: number, input: Partial<CouponInput>): Promise<Coupon> {
    const { data } = await apiClient.put<ApiResource<Coupon>>(
      API_ENDPOINTS.admin.coupon(id),
      input
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.admin.coupon(id));
  },
};
