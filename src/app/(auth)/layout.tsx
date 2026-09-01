import type * as React from "react";

import { Logo } from "@/components/shared/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <Logo />
      <div className="animate-in-fade-up w-full max-w-sm">{children}</div>
    </div>
  );
}