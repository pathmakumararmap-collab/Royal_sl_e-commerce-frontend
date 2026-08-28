"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Currency } from "@/components/shared/currency";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionGate } from "@/components/shared/permission-gate";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCancelPurchase, usePurchases } from "@/hooks/use-inventory";
import { formatDate } from "@/lib/format";
import type { Purchase } from "@/types/inventory";

const CANCELLABLE_STATUSES = ["pending", "ordered"];

export function PurchaseOrdersListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = usePurchases(page);
  const cancelPurchase = useCancelPurchase();
  const [cancelTarget, setCancelTarget] = React.useState<Purchase | undefined>(undefined);

  function goToPage(next: number) {
    router.push(`/admin/purchase-orders?page=${next}`);
  }

  const columns: ColumnDef<Purchase>[] = [
    {
      accessorKey: "purchase_no",
      header: "Purchase no.",
      cell: ({ row }) => <span className="font-medium">{row.original.purchase_no}</span>,
    },
    {
      id: "supplier",
      header: "Supplier",
      cell: ({ row }) => row.original.supplier?.name ?? "-",
    },
    {
      id: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => row.original.warehouse?.name ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "order_date",
      header: "Order date",
      cell: ({ row }) => formatDate(row.original.order_date),
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => <Currency value={row.original.total_amount} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        CANCELLABLE_STATUSES.includes(row.original.status) ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              setCancelTarget(row.original);
            }}
          >
            <X className="size-4" />
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="animate-in-fade-up space-y-6">
      <PageHeader
        title="Purchase orders"
        description="Raise and track stock purchases from suppliers."
        actions={
          <PermissionGate permission="purchases.create">
            <Button variant="gradient" onClick={() => router.push("/admin/purchase-orders/new")}>
              <Plus className="size-4" />
              New purchase order
            </Button>
          </PermissionGate>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          meta={data?.meta}
          onPageChange={goToPage}
          isLoading={isLoading}
          onRowClick={(row) => router.push(`/admin/purchase-orders/${row.id}`)}
          emptyTitle="No purchase orders yet"
          emptyDescription="Create a purchase order to restock a warehouse from a supplier."
        />
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(undefined)}
        title="Cancel purchase order?"
        description={`This will cancel purchase order "${cancelTarget?.purchase_no}". This action cannot be undone.`}
        confirmLabel="Cancel order"
        loading={cancelPurchase.isPending}
        onConfirm={() =>
          cancelTarget &&
          cancelPurchase.mutate(cancelTarget.id, {
            onSuccess: () => setCancelTarget(undefined),
          })
        }
      />
    </div>
  );
}
