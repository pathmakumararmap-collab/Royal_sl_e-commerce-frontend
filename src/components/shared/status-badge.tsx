import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { formatOrderStatus } from "@/lib/format";
import { cn } from "@/lib/utils";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const ORDER_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  packed: "info",
  shipped: "info",
  delivered: "success",
  completed: "success",
  cancelled: "destructive",
  returned: "destructive",
};

const PAYMENT_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  unpaid: "destructive",
  partial: "warning",
  paid: "success",
  refunded: "secondary",
};

const STOCK_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  active: "warning",
  resolved: "success",
};

const GENERIC_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending: "warning",
  ordered: "info",
  received: "success",
  cancelled: "destructive",
  in_transit: "info",
  approved: "success",
  rejected: "destructive",
  issued: "info",
  paid: "success",
  void: "secondary",
  active: "success",
  inactive: "secondary",
  banned: "destructive",
  completed: "success",
  failed: "destructive",
  refunded: "secondary",
};

function StatusBadgeBase({
  status,
  map,
  className,
}: {
  status: string;
  map: Record<string, BadgeVariant>;
  className?: string;
}) {
  return (
    <Badge variant={map[status] ?? "outline"} className={cn("capitalize", className)}>
      {formatOrderStatus(status)}
    </Badge>
  );
}

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadgeBase status={status} map={ORDER_STATUS_VARIANTS} className={className} />;
}

export function PaymentStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadgeBase status={status} map={PAYMENT_STATUS_VARIANTS} className={className} />;
}

export function AlertStatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadgeBase status={status} map={STOCK_STATUS_VARIANTS} className={className} />;
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <StatusBadgeBase status={status} map={GENERIC_STATUS_VARIANTS} className={className} />;
}
