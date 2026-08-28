import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "@/lib/constants/api";
import { getCartToken } from "@/lib/api/cart-token";
import { useAuthStore } from "@/store/auth-store";
import type { ApiErrorResponse } from "@/types/common";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  if (!config.headers.has("Content-Type") && !(config.data instanceof FormData)) {
    config.headers.set("Content-Type", "application/json");
  }

  const cartToken = getCartToken();
  if (cartToken) {
    config.headers.set("X-Cart-Token", cartToken);
  }

  return config;
});

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ??
      error.message ??
      "Something went wrong. Please try again.";
    const errors = error.response?.data?.errors;

    if (status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().logout();
      const isAuthPage =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register");

      if (!isAuthPage) {
        const redirectTo = encodeURIComponent(
          window.location.pathname + window.location.search
        );
        window.location.href = `/login?redirect=${redirectTo}`;
      }
    }

    return Promise.reject(new ApiError(message, status, errors));
  }
);
