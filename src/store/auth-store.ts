import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { setAuthCookie, clearAuthCookie } from "@/lib/api/token";
import { clearCartToken } from "@/lib/api/cart-token";
import type { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        setAuthCookie(token);
        set({ user, token, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        clearAuthCookie();
        clearCartToken();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "royal-sl-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export function isAdminRole(user: User | null): boolean {
  if (!user?.roles) return false;
  return user.roles.some((role) =>
    ["admin", "manager", "warehouse_manager", "pos_cashier"].includes(role)
  );
}

export function hasRole(user: User | null, ...roles: string[]): boolean {
  if (!user?.roles) return false;
  return user.roles.some((role) => roles.includes(role));
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user?.permissions) return false;
  return user.permissions.includes(permission);
}
