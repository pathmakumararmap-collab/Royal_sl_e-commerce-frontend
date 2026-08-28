"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useAuthBootstrap } from "@/hooks/use-auth";
import { hasRole, useAuthStore } from "@/store/auth-store";

/** Gates children behind an authenticated session (client-side; middleware already redirects unauthenticated requests at the edge). */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { hasHydrated } = useAuthBootstrap();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  React.useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return <>{children}</>;
}

const STAFF_ROLES = ["admin", "manager", "warehouse_manager", "pos_cashier"];

/** Gates children behind an authenticated staff session (any non-customer role). */
export function RequireStaff({ children }: { children: React.ReactNode }) {
  const { hasHydrated } = useAuthBootstrap();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const isStaff = hasRole(user, ...STAFF_ROLES);

  React.useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace("/login?redirect=/admin");
      return;
    }

    if (user && !isStaff) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, isStaff, router, user]);

  if (!hasHydrated || !isAuthenticated || !user || !isStaff) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  return <>{children}</>;
}
