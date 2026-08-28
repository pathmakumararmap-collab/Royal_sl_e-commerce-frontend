import type * as React from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { RequireStaff } from "@/components/shared/require-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireStaff>
      <AdminShell>{children}</AdminShell>
    </RequireStaff>
  );
}
