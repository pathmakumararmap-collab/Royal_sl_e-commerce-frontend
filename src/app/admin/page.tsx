import type { Metadata } from "next";

import { DashboardOverview } from "@/components/admin/dashboard-overview";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of orders, revenue, and stock health.",
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <DashboardOverview />;
}
