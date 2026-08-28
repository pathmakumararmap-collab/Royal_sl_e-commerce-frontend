import type { Metadata } from "next";

import { OrderDetailAdminContent } from "@/components/admin/order-detail-admin-content";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View and manage an order.",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <OrderDetailAdminContent orderId={Number(id)} />;
}
