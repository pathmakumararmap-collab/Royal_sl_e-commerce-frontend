import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Currency({
  value,
  className,
}: {
  value: number | string;
  className?: string;
}) {
  return <span className={cn("font-mono tabular-nums", className)}>{formatCurrency(value)}</span>;
}
