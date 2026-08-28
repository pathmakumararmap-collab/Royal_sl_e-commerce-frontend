import type * as React from "react";

import { DashboardShell } from "@/components/customer/dashboard-shell";
import { RequireAuth } from "@/components/shared/require-auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
