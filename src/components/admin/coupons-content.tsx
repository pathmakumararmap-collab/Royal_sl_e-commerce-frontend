"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CouponFormDialog } from "@/components/admin/coupon-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useCoupons, useDeleteCoupon } from "@/hooks/use-coupons";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Coupon } from "@/types/coupon";

function discountLabel(coupon: Coupon): string {
  return coupon.type === "percentage" ? `${coupon.value}%` : formatCurrency(coupon.value);
}

export function CouponsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = useCoupons(page);
  const deleteCoupon = useDeleteCoupon();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Coupon | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Coupon | undefined>(undefined);

  function goToPage(next: number) {
    router.push(`/admin/coupons?page=${next}`);
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
        <span className="bg-muted text-foreground inline-flex items-center rounded-md px-2 py-1 font-mono text-xs font-semibold tracking-wide">
          {row.original.code}
        </span>
      ),
    },
    {
      id: "discount",
      header: "Discount",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{discountLabel(row.original)}</span>
      ),
    },
    {
      accessorKey: "min_order_amount",
      header: "Min. order",
      cell: ({ row }) => (
        <span className="tabular-nums">{formatCurrency(row.original.min_order_amount ?? 0)}</span>
      ),
    },
    {
      id: "usage",
      header: "Usage",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <span className="tabular-nums text-sm">
            {coupon.used_count} / {coupon.usage_limit ?? "∞"}
          </span>
        );
      },
    },
    {
      id: "validity",
      header: "Validity",
      cell: ({ row }) => {
        const coupon = row.original;
        if (!coupon.starts_at && !coupon.expires_at)
          return <span className="text-muted-foreground text-sm">No limit</span>;
        return (
          <span className="tabular-nums text-sm">
            {formatDate(coupon.starts_at)} – {formatDate(coupon.expires_at)}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const coupon = row.original;
        return (
          <div className="flex flex-wrap gap-1">
            <Badge variant={coupon.is_active ? "success" : "secondary"}>
              {coupon.is_active ? "Active" : "Inactive"}
            </Badge>
            {!coupon.is_valid && (
              <Badge variant="outline" className="text-muted-foreground">
                Not valid
              </Badge>
            )}
          </div>
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
            aria-label="Edit coupon"
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
            aria-label="Delete coupon"
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
        title="Coupons"
        description="Create and manage discount codes for customers at checkout."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New coupon
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        onPageChange={goToPage}
        isLoading={isLoading}
        emptyTitle="No coupons yet"
        emptyDescription="Create your first coupon to offer discounts to customers."
      />

      <CouponFormDialog open={formOpen} onOpenChange={setFormOpen} coupon={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete coupon?"
        description={`This will permanently remove the coupon "${deleteTarget?.code}". This action cannot be undone.`}
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
