"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
  showCount?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-6",
};

export function StarRating({
  value,
  count,
  size = "md",
  interactive = false,
  onChange,
  showCount = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center" onMouseLeave={() => setHoverValue(null)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.round(displayValue);

          if (!interactive) {
            return (
              <Star
                key={star}
                className={cn(
                  SIZE_CLASSES[size],
                  filled ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40"
                )}
              />
            );
          }

          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverValue(star)}
              onClick={() => onChange?.(star)}
              className="p-0.5"
              aria-label={`Rate ${star} out of 5`}
            >
              <Star
                className={cn(
                  SIZE_CLASSES[size],
                  filled ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40"
                )}
              />
            </button>
          );
        })}
      </div>
      {showCount && (
        <span className="text-muted-foreground text-xs">
          {value > 0 ? value.toFixed(1) : "No ratings"}
          {typeof count === "number" && count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}
