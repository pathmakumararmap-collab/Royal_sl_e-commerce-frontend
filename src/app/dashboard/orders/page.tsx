import type { Metadata } from "next";

import { CustomerOrdersContent } from "@/components/customer/orders-content";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track all your orders.",
  robots: { index: false, follow: false },
};

export default function DashboardOrdersPage() {
  return <CustomerOrdersContent />;
}
