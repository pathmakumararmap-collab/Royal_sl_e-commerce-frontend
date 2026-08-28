import type { Metadata } from "next";

import { RevenueReportContent } from "@/components/admin/revenue-report-content";

export const metadata: Metadata = {
  title: "Revenue Report",
  description: "Revenue composition: sales, discounts, tax, and shipping.",
  robots: { index: false, follow: false },
};

export default function RevenueReportPage() {
  return <RevenueReportContent />;
}
