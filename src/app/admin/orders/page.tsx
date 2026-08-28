import type { Metadata } from "next";

import { OrdersListContent } from "@/components/admin/orders-list-content";

export const metadata: Metadata = {
  title: "Orders",
  description: "Manage and fulfil customer orders.",
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return <OrdersListContent />;
}
