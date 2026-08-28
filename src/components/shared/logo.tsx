import Link from "next/link";
import { Crown } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/constants/site";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <span className="bg-gradient-brand shadow-luxury-sm flex size-8 shrink-0 items-center justify-center rounded-lg text-white">
        <Crown className="size-4.5" />
      </span>
      <span className="text-lg">{siteConfig.name}</span>
    </Link>
  );
}
