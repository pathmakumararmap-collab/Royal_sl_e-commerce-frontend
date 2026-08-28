"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { AlertStatusBadge } from "@/components/shared/status-badge";
import { useLowStockAlerts } from "@/hooks/use-inventory";
import type { LowStockAlert } from "@/types/inventory";

export function LowStockAlertsTab() {
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isError, refetch } = useLowStockAlerts(page);

  const columns: ColumnDef<LowStockAlert>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.product?.name ?? "-"}</div>
          <div className="text-muted-foreground text-xs">{row.original.product?.sku}</div>
        </div>
      ),
    },
    {
      id: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => row.original.warehouse?.name ?? "-",
    },
    {
      accessorKey: "threshold",
      header: "Threshold",
    },
    {
      accessorKey: "current_quantity",
      header: "Current qty",
      cell: ({ row }) => (
        <span className="text-destructive tabular-nums font-semibold">{row.original.current_quantity}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <AlertStatusBadge status={row.original.status} />,
    },
  ];

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      meta={data?.meta}
      onPageChange={setPage}
      isLoading={isLoading}
      emptyTitle="No low stock alerts"
      emptyDescription="Products that fall below their reorder threshold will show up here."
    />
  );
}
