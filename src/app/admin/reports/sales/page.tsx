import type { Metadata } from "next";

import { SalesReportContent } from "@/components/admin/sales-report-content";

export const metadata: Metadata = {
  title: "Sales Report",
  description: "Sales performance over a date range.",
  robots: { index: false, follow: false },
};

export default function SalesReportPage() {
  return <SalesReportContent />;
}
