import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <Card className={cn("hover-lift-sm group gap-3 overflow-hidden py-5", className)}>
      <CardContent className="relative px-5">
        <div
          className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-primary/[0.06] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
            <p className="text-display tabular-nums text-2xl">{value}</p>
          </div>
          {Icon && (
            <div className="bg-primary/10 text-primary ring-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105">
              <Icon className="size-4.5" />
            </div>
          )}
        </div>
        {trend && (
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            <span>
              {Math.abs(trend.value)}% {trend.label ?? "vs last period"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
