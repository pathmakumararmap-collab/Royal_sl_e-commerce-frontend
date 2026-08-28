import type { Metadata } from "next";

import { ProfileContent } from "@/components/customer/profile-content";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Update your personal details and profile photo.",
  robots: { index: false, follow: false },
};

export default function DashboardProfilePage() {
  return <ProfileContent />;
}
