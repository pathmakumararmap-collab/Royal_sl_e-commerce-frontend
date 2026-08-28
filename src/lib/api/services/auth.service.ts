import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/constants/api";
import type { AuthResponse, LoginInput, RegisterInput } from "@/types/auth";
import type { User } from "@/types/user";

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      input
    );
    return data;
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      input
    );
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<{ user: User }>(
      API_ENDPOINTS.auth.me
    );
    return data.user;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.forgotPassword,
      { email }
    );
    return data;
  },

  async resetPassword(input: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.resetPassword,
      input
    );
    return data;
  },
};
