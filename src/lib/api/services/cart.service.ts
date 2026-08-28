import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { ApiResource } from "@/types/common";
import type { Cart } from "@/types/cart";

export const cartService = {
  async get(): Promise<Cart> {
    const { data } = await apiClient.get<ApiResource<Cart>>(
      API_ENDPOINTS.cart.show
    );
    return data.data;
  },

  async addItem(input: {
    product_id: number;
    product_variant_id?: number | null;
    quantity: number;
  }): Promise<Cart> {
    const { data } = await apiClient.post<ApiResource<Cart>>(
      API_ENDPOINTS.cart.items,
      input
    );
    return data.data;
  },

  async updateItem(itemId: number, quantity: number): Promise<Cart> {
    const { data } = await apiClient.put<ApiResource<Cart>>(
      API_ENDPOINTS.cart.item(itemId),
      { quantity }
    );
    return data.data;
  },

  async removeItem(itemId: number): Promise<Cart> {
    const { data } = await apiClient.delete<ApiResource<Cart>>(
      API_ENDPOINTS.cart.item(itemId)
    );
    return data.data;
  },

  async clear(): Promise<Cart> {
    const { data } = await apiClient.delete<ApiResource<Cart>>(
      API_ENDPOINTS.cart.show
    );
    return data.data;
  },
};
