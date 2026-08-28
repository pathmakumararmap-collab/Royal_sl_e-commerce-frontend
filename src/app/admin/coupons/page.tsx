import type { Metadata } from "next";

import { CouponsContent } from "@/components/admin/coupons-content";

export const metadata: Metadata = {
  title: "Coupons",
  description: "Manage discount coupons for the storefront.",
  robots: { index: false, follow: false },
};

export default function AdminCouponsPage() {
  return <CouponsContent />;
}
