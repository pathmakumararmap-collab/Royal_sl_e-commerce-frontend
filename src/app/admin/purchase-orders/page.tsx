import type { Metadata } from "next";

import { PurchaseOrdersListContent } from "@/components/admin/purchase-orders-list-content";

export const metadata: Metadata = {
  title: "Purchase Orders",
  description: "Track purchase orders raised with suppliers.",
  robots: { index: false, follow: false },
};

export default function PurchaseOrdersPage() {
  return <PurchaseOrdersListContent />;
}
