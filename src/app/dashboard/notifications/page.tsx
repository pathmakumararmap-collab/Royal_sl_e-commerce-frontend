import type { Metadata } from "next";

import { NotificationsContent } from "@/components/customer/notifications-content";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Stay up to date with your order and account notifications.",
  robots: { index: false, follow: false },
};

export default function DashboardNotificationsPage() {
  return <NotificationsContent />;
}
