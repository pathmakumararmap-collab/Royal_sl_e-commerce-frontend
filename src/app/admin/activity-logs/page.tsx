import type { Metadata } from "next";

import { ActivityLogsContent } from "@/components/admin/activity-logs-content";

export const metadata: Metadata = {
  title: "Activity Logs",
  description: "Audit trail of actions taken across the system.",
  robots: { index: false, follow: false },
};

export default function AdminActivityLogsPage() {
  return <ActivityLogsContent />;
}
