import type { Metadata } from "next";

import { PosTerminalContent } from "@/components/admin/pos-terminal-content";

export const metadata: Metadata = {
  title: "POS",
  description: "Point of sale terminal for in-store checkouts.",
  robots: { index: false, follow: false },
};

export default function PosPage() {
  return <PosTerminalContent />;
}
