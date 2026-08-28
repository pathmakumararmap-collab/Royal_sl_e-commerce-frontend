import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { ApiResource, PaginatedResponse } from "@/types/common";
import type { User } from "@/types/user";
import type { CreateUserInput, Permission, Role, UpdateUserInput } from "@/types/role";

export const userService = {
  async list(page = 1, perPage = 15): Promise<PaginatedResponse<User>> {
    const { data } = await apiClient.get<PaginatedResponse<User>>(
      API_ENDPOINTS.admin.users,
      { params: { page, per_page: perPage } }
    );
    return data;
  },

  async get(id: number): Promise<User> {
    const { data } = await apiClient.get<ApiResource<User>>(
      API_ENDPOINTS.admin.user(id)
    );
    return data.data;
  },

  async create(input: CreateUserInput): Promise<User> {
    const { data } = await apiClient.post<ApiResource<User>>(
      API_ENDPOINTS.admin.users,
      input
    );
    return data.data;
  },

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const { data } = await apiClient.put<ApiResource<User>>(
      API_ENDPOINTS.admin.user(id),
      input
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.admin.user(id));
  },
};

export const roleService = {
  async list(): Promise<Role[]> {
    const { data } = await apiClient.get<{ data: Role[] }>(
      API_ENDPOINTS.admin.roles
    );
    return data.data;
  },

  async create(input: { name: string; permissions: string[] }): Promise<Role> {
    const { data } = await apiClient.post<{ data: Role }>(
      API_ENDPOINTS.admin.roles,
      input
    );
    return data.data;
  },

  async updatePermissions(id: number, permissions: string[]): Promise<Role> {
    const { data } = await apiClient.put<{ data: Role }>(
      API_ENDPOINTS.admin.role(id),
      { permissions }
    );
    return data.data;
  },

  async permissions(): Promise<Permission[]> {
    const { data } = await apiClient.get<{ data: Permission[] }>(
      API_ENDPOINTS.admin.permissions
    );
    return data.data;
  },
};
