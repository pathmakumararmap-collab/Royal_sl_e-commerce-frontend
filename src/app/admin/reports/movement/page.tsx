import type { Metadata } from "next";

import { MovementReportContent } from "@/components/admin/movement-report-content";

export const metadata: Metadata = {
  title: "Movement Report",
  description: "Fast moving, slow moving, and non-moving item reports.",
  robots: { index: false, follow: false },
};

export default function MovementReportPage() {
  return <MovementReportContent />;
}
