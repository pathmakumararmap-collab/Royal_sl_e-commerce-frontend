import type { Metadata } from "next";

import { CouponsContent } from "@/components/customer/coupons-content";

export const metadata: Metadata = {
  title: "Coupons",
  description: "Learn how to apply discount coupons to your orders.",
  robots: { index: false, follow: false },
};

export default function DashboardCouponsPage() {
  return <CouponsContent />;
}
