import type { Metadata } from "next";

import { PermissionsContent } from "@/components/admin/permissions-content";

export const metadata: Metadata = {
  title: "Permissions",
  description: "Reference list of all system permissions.",
  robots: { index: false, follow: false },
};

export default function AdminPermissionsPage() {
  return <PermissionsContent />;
}
