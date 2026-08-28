import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import { buildFormData } from "@/lib/api/form-data";
import type { ApiResource } from "@/types/common";
import type { Address, AddressInput } from "@/types/user";
import type { User } from "@/types/user";

export const addressService = {
  async list(): Promise<Address[]> {
    const { data } = await apiClient.get<ApiResource<Address[]>>(
      API_ENDPOINTS.customer.addresses
    );
    return data.data;
  },

  async create(input: AddressInput): Promise<Address> {
    const { data } = await apiClient.post<ApiResource<Address>>(
      API_ENDPOINTS.customer.addresses,
      input
    );
    return data.data;
  },

  async update(id: number, input: Partial<AddressInput>): Promise<Address> {
    const { data } = await apiClient.put<ApiResource<Address>>(
      API_ENDPOINTS.customer.address(id),
      input
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.customer.address(id));
  },
};

export interface ProfileUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: File;
}

export const profileService = {
  async update(input: ProfileUpdateInput): Promise<User> {
    if (input.avatar instanceof File) {
      const formData = buildFormData(input, "PUT");
      const { data } = await apiClient.post<ApiResource<User>>(
        API_ENDPOINTS.customer.profile,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    }

    const { data } = await apiClient.put<ApiResource<User>>(
      API_ENDPOINTS.customer.profile,
      input
    );
    return data.data;
  },
};
