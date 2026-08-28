import { AUTH_TOKEN_COOKIE } from "@/lib/constants/api";

/**
 * The Zustand auth store (persisted to localStorage) is the single source of
 * truth for the token in JS. This module only mirrors it into a plain,
 * JS-readable cookie so `middleware.ts` (which runs on the edge, without
 * access to localStorage) can gate protected routes.
 */
export function setAuthCookie(token: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=${token}; path=/; max-age=${
    60 * 60 * 24 * 30
  }; SameSite=Lax`;
}

export function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0`;
}
