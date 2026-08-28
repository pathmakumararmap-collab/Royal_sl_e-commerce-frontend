import type { Metadata } from "next";

import { LandingContent } from "@/components/storefront/landing-content";
import { siteConfig } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: `${siteConfig.fullName} — Shop Electronics, Fashion, Groceries & More`,
  description: siteConfig.description,
};

export default function LandingPage() {
  return <LandingContent />;
}
