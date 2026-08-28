import type { Metadata } from "next";

import { DashboardOverviewContent } from "@/components/customer/dashboard-overview-content";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "View your recent orders, addresses, and account activity.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardOverviewContent />;
}
