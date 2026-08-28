import type { Metadata } from "next";

import { StockReportContent } from "@/components/admin/stock-report-content";

export const metadata: Metadata = {
  title: "Stock Report",
  description: "Total stock on hand, low stock items, and recent movements.",
  robots: { index: false, follow: false },
};

export default function StockReportPage() {
  return <StockReportContent />;
}
