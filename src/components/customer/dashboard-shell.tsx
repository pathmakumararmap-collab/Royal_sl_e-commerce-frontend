import type * as React from "react";

import { DashboardSidebar } from "@/components/customer/dashboard-sidebar";
import { DashboardHeader } from "@/components/customer/dashboard-header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/20 flex min-h-screen">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="container-page flex-1 py-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
