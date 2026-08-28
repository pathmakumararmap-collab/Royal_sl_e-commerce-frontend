import type { Metadata } from "next";

import { AnalyticsContent } from "@/components/admin/analytics-content";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Sales, order, and product performance reports.",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return <AnalyticsContent />;
}
