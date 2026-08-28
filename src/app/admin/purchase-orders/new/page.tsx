import type { Metadata } from "next";

import { PurchaseOrderFormContent } from "@/components/admin/purchase-order-form-content";

export const metadata: Metadata = {
  title: "New Purchase Order",
  description: "Raise a new purchase order with a supplier.",
  robots: { index: false, follow: false },
};

export default function NewPurchaseOrderPage() {
  return <PurchaseOrderFormContent />;
}
