"use client";

import type * as React from "react";

import { hasPermission, hasRole, useAuthStore } from "@/store/auth-store";

interface PermissionGateProps {
  permission?: string;
  roles?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  roles,
  fallback = null,
  children,
}: PermissionGateProps) {
  const user = useAuthStore((state) => state.user);

  const allowed =
    (!permission || hasPermission(user, permission)) &&
    (!roles?.length || hasRole(user, ...roles));

  return allowed ? <>{children}</> : <>{fallback}</>;
}
