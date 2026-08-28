"use client";

import { useAuthBootstrap, useCurrentUser } from "@/hooks/use-auth";

/** Silently rehydrates/refreshes the current user once the persisted auth store is ready. */
export function AuthBootstrap() {
  const { hasHydrated, token } = useAuthBootstrap();
  useCurrentUser();

  void hasHydrated;
  void token;

  return null;
}
