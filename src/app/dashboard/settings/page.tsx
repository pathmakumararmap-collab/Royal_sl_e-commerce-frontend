import type { Metadata } from "next";

import { SettingsContent } from "@/components/customer/settings-content";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your appearance and account preferences.",
  robots: { index: false, follow: false },
};

export default function DashboardSettingsPage() {
  return <SettingsContent />;
}
