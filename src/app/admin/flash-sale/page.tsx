import type { Metadata } from "next";

import { FlashSaleContent } from "@/components/admin/flash-sale-content";

export const metadata: Metadata = {
  title: "Flash Sale",
  description: "Manage time-boxed, product-specific flash sale discounts.",
  robots: { index: false, follow: false },
};

export default function AdminFlashSalePage() {
  return <FlashSaleContent />;
}
