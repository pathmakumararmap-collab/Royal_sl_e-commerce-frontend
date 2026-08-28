"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { useStockMovements, useWarehouses } from "@/hooks/use-inventory";
import { formatDateTime, formatOrderStatus } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StockMovement, StockMovementType } from "@/types/inventory";

const MOVEMENT_TYPES: StockMovementType[] = [
  "purchase",
  "sale",
  "return",
  "damage",
  "adjustment",
  "transfer_in",
  "transfer_out",
  "initial",
];

export function MovementsTab() {
  const { data: warehouses } = useWarehouses();
  const [warehouseId, setWarehouseId] = React.useState<string>("all");
  const [type, setType] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError, refetch } = useStockMovements({
    warehouse_id: warehouseId === "all" ? undefined : Number(warehouseId),
    type: type === "all" ? undefined : type,
    page,
  });

  const columns: ColumnDef<StockMovement>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => row.original.product?.name ?? "-",
    },
    {
      id: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => row.original.warehouse?.name ?? "-",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{formatOrderStatus(row.original.type)}</Badge>,
    },
    {
      accessorKey: "quantity_change",
      header: "Change",
      cell: ({ row }) => {
        const change = row.original.quantity_change;
        return (
          <span className={cn("tabular-nums font-semibold", change >= 0 ? "text-success" : "text-destructive")}>
            {change >= 0 ? `+${change}` : change}
          </span>
        );
      },
    },
    {
      id: "before_after",
      header: "Before → After",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.quantity_before} → {row.original.quantity_after}
        </span>
      ),
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => row.original.note || "-",
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
  ];

  const toolbar = (
    <div className="bg-card/50 flex flex-wrap items-center gap-3 rounded-xl border p-3">
      <Select
        value={warehouseId}
        onValueChange={(value) => {
          setWarehouseId(value);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-56">
          <SelectValue placeholder="All warehouses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All warehouses</SelectItem>
          {(warehouses ?? []).map((warehouse) => (
            <SelectItem key={warehouse.id} value={String(warehouse.id)}>
              {warehouse.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={type}
        onValueChange={(value) => {
          setType(value);
          setPage(1);
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {MOVEMENT_TYPES.map((movementType) => (
            <SelectItem key={movementType} value={movementType}>
              {formatOrderStatus(movementType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

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
      toolbar={toolbar}
      emptyTitle="No stock movements"
      emptyDescription="Stock movements are recorded automatically as sales, purchases, and adjustments happen."
    />
  );
}
