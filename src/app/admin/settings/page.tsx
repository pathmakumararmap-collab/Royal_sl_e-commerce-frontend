import type { Metadata } from "next";

import { SettingsContent } from "@/components/admin/settings-content";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure store-wide settings such as accepted payment methods.",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return <SettingsContent />;
}
