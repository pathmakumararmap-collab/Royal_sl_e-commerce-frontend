import type { Metadata } from "next";

import { OrderDetailContent } from "@/components/customer/order-detail-content";

export const metadata: Metadata = {
  title: "Order Details",
  description: "View your order details, items, and delivery tracking.",
  robots: { index: false, follow: false },
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  return <OrderDetailContent orderId={Number(id)} />;
}
