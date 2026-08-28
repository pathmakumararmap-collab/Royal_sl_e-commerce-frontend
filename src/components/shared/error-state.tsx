"use client";

import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "animate-in-fade-up flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center",
        className
      )}
    >
      <div className="bg-destructive/10 text-destructive ring-destructive/15 flex size-14 items-center justify-center rounded-2xl ring-1">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-muted-foreground max-w-sm text-sm text-balance">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RotateCw className="size-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
