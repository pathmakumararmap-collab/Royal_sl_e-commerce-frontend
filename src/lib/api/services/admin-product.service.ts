import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { buildFormData } from "@/lib/api/form-data";
import type { ApiResource, PaginatedResponse } from "@/types/common";
import type {
  Brand,
  Category,
  Product,
  ProductFilters,
  ProductInput,
} from "@/types/catalog";

export interface AdminProductVariantInput {
  id?: number;
  sku: string;
  barcode: string;
  attributes: Record<string, string>;
  cost_price: number;
  selling_price: number;
  image?: File;
  initial_quantity?: number;
}

export interface AdminProductCreateInput extends ProductInput {
  variants?: AdminProductVariantInput[];
  images?: File[];
  warehouse_id?: number;
  initial_quantity?: number;
}

export interface AdminProductUpdateInput extends Partial<ProductInput> {
  variants?: AdminProductVariantInput[];
  images?: File[];
}

export const adminProductService = {
  async list(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.admin.products,
      { params: filters }
    );
    return data;
  },

  async get(id: number): Promise<Product> {
    const { data } = await apiClient.get<ApiResource<Product>>(
      API_ENDPOINTS.admin.product(id)
    );
    return data.data;
  },

  async create(input: AdminProductCreateInput): Promise<Product> {
    const hasVariantImage = input.variants?.some((variant) => variant.image instanceof File);

    if (input.images?.length || hasVariantImage) {
      const formData = buildFormData(input);
      const { data } = await apiClient.post<ApiResource<Product>>(
        API_ENDPOINTS.admin.products,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    }

    const { data } = await apiClient.post<ApiResource<Product>>(
      API_ENDPOINTS.admin.products,
      input
    );
    return data.data;
  },

  async update(id: number, input: AdminProductUpdateInput): Promise<Product> {
    const hasVariantImage = input.variants?.some((variant) => variant.image instanceof File);

    if (input.images?.length || hasVariantImage) {
      const formData = buildFormData(input, "PUT");
      const { data } = await apiClient.post<ApiResource<Product>>(
        API_ENDPOINTS.admin.product(id),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    }

    const { data } = await apiClient.put<ApiResource<Product>>(
      API_ENDPOINTS.admin.product(id),
      input
    );
    return data.data;
  },

  async deleteImage(productId: number, imageId: number): Promise<Product> {
    const { data } = await apiClient.delete<ApiResource<Product>>(
      API_ENDPOINTS.admin.productImage(productId, imageId)
    );
    return data.data;
  },

  async deleteVariant(productId: number, variantId: number): Promise<Product> {
    const { data } = await apiClient.delete<ApiResource<Product>>(
      API_ENDPOINTS.admin.productVariant(productId, variantId)
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.admin.product(id));
  },

  barcodeUrl(id: number): string {
    return `${apiClient.defaults.baseURL}${API_ENDPOINTS.admin.productBarcode(id)}`;
  },
};

export interface CategoryInput {
  parent_id?: number | null;
  name: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
  image?: File;
}

export const categoryService = {
  async list(): Promise<Category[]> {
    const { data } = await apiClient.get<ApiResource<Category[]>>(
      API_ENDPOINTS.admin.categories
    );
    return data.data;
  },

  async create(input: CategoryInput): Promise<Category> {
    if (input.image instanceof File) {
      const formData = buildFormData(input);
      const { data } = await apiClient.post<ApiResource<Category>>(
        API_ENDPOINTS.admin.categories,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    }

    const { data } = await apiClient.post<ApiResource<Category>>(
      API_ENDPOINTS.admin.categories,
      input
    );
    return data.data;
  },

  async update(id: number, input: Partial<CategoryInput>): Promise<Category> {
    if (input.image instanceof File) {
      const formData = buildFormData(input, "PUT");
      const { data } = await apiClient.post<ApiResource<Category>>(
        API_ENDPOINTS.admin.category(id),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    }

    const { data } = await apiClient.put<ApiResource<Category>>(
      API_ENDPOINTS.admin.category(id),
      input
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.admin.category(id));
  },
};

export interface BrandInput {
  name: string;
  slug?: string;
  is_active?: boolean;
  logo?: File;
}

export const brandService = {
  async list(): Promise<Brand[]> {
    const { data } = await apiClient.get<ApiResource<Brand[]>>(
      API_ENDPOINTS.admin.brands
    );
    return data.data;
  },

  async create(input: BrandInput): Promise<Brand> {
    if (input.logo instanceof File) {
      const formData = buildFormData(input);
      const { data } = await apiClient.post<ApiResource<Brand>>(
        API_ENDPOINTS.admin.brands,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    }

    const { data } = await apiClient.post<ApiResource<Brand>>(
      API_ENDPOINTS.admin.brands,
      input
    );
    return data.data;
  },

  async update(id: number, input: Partial<BrandInput>): Promise<Brand> {
    if (input.logo instanceof File) {
      const formData = buildFormData(input, "PUT");
      const { data } = await apiClient.post<ApiResource<Brand>>(
        API_ENDPOINTS.admin.brand(id),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    }

    const { data } = await apiClient.put<ApiResource<Brand>>(
      API_ENDPOINTS.admin.brand(id),
      input
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.admin.brand(id));
  },
};
