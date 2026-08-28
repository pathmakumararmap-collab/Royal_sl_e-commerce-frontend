"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame, Pencil, Plus, Trash2, Zap } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlashSaleFormDialog } from "@/components/admin/flash-sale-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useCoupons, useDeleteCoupon } from "@/hooks/use-coupons";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/types/coupon";

function discountLabel(coupon: Coupon): string {
  return coupon.type === "percentage" ? `${coupon.value}% off` : `${formatCurrency(coupon.value)} off`;
}

/**
 * Purely presentational countdown text derived from an existing coupon
 * field — no new data source, just a friendlier read of expires_at to
 * reinforce the "time-boxed" framing of a flash sale.
 */
function countdownLabel(coupon: Coupon): { text: string; urgent: boolean } {
  if (!coupon.expires_at) return { text: "No end date", urgent: false };
  const diffMs = new Date(coupon.expires_at).getTime() - Date.now();
  if (diffMs <= 0) return { text: "Ended", urgent: false };
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return { text: "Ending soon", urgent: true };
  if (hours < 24) return { text: `${hours}h left`, urgent: true };
  const days = Math.floor(hours / 24);
  return { text: `${days}d left`, urgent: days <= 2 };
}

/**
 * Scope decision: the backend has no separate "flash sale" entity — a flash
 * sale is simply a coupon with applicable_to = "product" and a short
 * starts_at/expires_at window. This page reuses the coupon list/hooks and
 * filters to product-scoped coupons, presenting them under a flash-sale
 * framing. Creating one here always sets applicable_to = "product".
 */
export function FlashSaleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = useCoupons(page);
  const deleteCoupon = useDeleteCoupon();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Coupon | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Coupon | undefined>(undefined);

  const flashSales = React.useMemo(
    () => (data?.data ?? []).filter((coupon) => coupon.applicable_to === "product"),
    [data]
  );

  function goToPage(next: number) {
    router.push(`/admin/flash-sale?page=${next}`);
  }

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setFormOpen(true);
  }

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="bg-accent/15 text-accent-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs font-semibold tracking-wide">
          <Zap className="size-3" />
          {row.original.code}
        </span>
      ),
    },
    {
      id: "discount",
      header: "Discount",
      cell: ({ row }) => (
        <span className="tabular-nums font-semibold">{discountLabel(row.original)}</span>
      ),
    },
    {
      id: "window",
      header: "Sale window",
      cell: ({ row }) => {
        const coupon = row.original;
        const countdown = countdownLabel(coupon);
        return (
          <div className="space-y-1">
            <p className="tabular-nums text-sm">
              {formatDateTime(coupon.starts_at)} – {formatDateTime(coupon.expires_at)}
            </p>
            {coupon.is_valid && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium",
                  countdown.urgent ? "text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Flame className={cn("size-3", countdown.urgent && "text-accent")} />
                {countdown.text}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "usage",
      header: "Redeemed",
      cell: ({ row }) => <span className="tabular-nums">{row.original.used_count}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <Badge variant={coupon.is_valid ? "gold" : "secondary"}>
            {coupon.is_valid ? "Live" : coupon.is_active ? "Not yet live / ended" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:bg-primary/10 hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
              openEdit(row.original);
            }}
            aria-label="Edit flash sale"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:bg-destructive/10 hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              setDeleteTarget(row.original);
            }}
            aria-label="Delete flash sale"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flash sales"
        description="Time-boxed, product-specific discounts. Flash sales are coupons scoped to selected products with a short validity window — manage all discount codes under Coupons."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="gold" className="hidden gap-1 sm:inline-flex">
              <Flame className="size-3" />
              Limited time
            </Badge>
            <Button variant="gold" onClick={openCreate}>
              <Plus className="size-4" />
              New flash sale
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={flashSales}
        meta={data?.meta}
        onPageChange={goToPage}
        isLoading={isLoading}
        emptyTitle="No flash sales yet"
        emptyDescription="Create a product-scoped coupon with a short window to run a flash sale."
      />

      <FlashSaleFormDialog open={formOpen} onOpenChange={setFormOpen} coupon={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete flash sale?"
        description={`This will permanently remove the flash sale "${deleteTarget?.code}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteCoupon.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCoupon.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(undefined),
          });
        }}
      />
    </div>
  );
}
