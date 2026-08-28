import type { Metadata } from "next";

import { PurchaseOrderDetailContent } from "@/components/admin/purchase-order-detail-content";

export const metadata: Metadata = {
  title: "Purchase Order",
  description: "View purchase order details and receive stock.",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchaseOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PurchaseOrderDetailContent id={Number(id)} />;
}
