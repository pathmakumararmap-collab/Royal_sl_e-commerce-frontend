import type { Metadata } from "next";

import { CampaignsContent } from "@/components/admin/campaigns-content";

export const metadata: Metadata = {
  title: "Campaigns",
  description: "Plan and track marketing campaigns across channels.",
  robots: { index: false, follow: false },
};

export default function AdminCampaignsPage() {
  return <CampaignsContent />;
}
