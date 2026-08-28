import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "animate-in-fade-up flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center",
        className
      )}
    >
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary ring-border/60 flex size-14 items-center justify-center rounded-2xl ring-1">
        <Icon className="size-6" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <p className="text-muted-foreground max-w-sm text-sm text-balance">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
