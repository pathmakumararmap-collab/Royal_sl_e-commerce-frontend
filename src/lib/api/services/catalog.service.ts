import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { ApiResource, PaginatedResponse } from "@/types/common";
import type { Brand, Category, Product, ProductFilters } from "@/types/catalog";

export const catalogService = {
  async listProducts(
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> {
    const { data } = await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.catalog.products,
      { params: filters }
    );
    return data;
  },

  async getProduct(slug: string): Promise<Product> {
    const { data } = await apiClient.get<ApiResource<Product>>(
      API_ENDPOINTS.catalog.product(slug)
    );
    return data.data;
  },

  async listCategories(): Promise<Category[]> {
    const { data } = await apiClient.get<ApiResource<Category[]>>(
      API_ENDPOINTS.catalog.categories
    );
    return data.data;
  },

  async listBrands(): Promise<Brand[]> {
    const { data } = await apiClient.get<ApiResource<Brand[]>>(
      API_ENDPOINTS.catalog.brands
    );
    return data.data;
  },
};
