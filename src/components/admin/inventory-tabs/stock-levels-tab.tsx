"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { useStock, useWarehouses } from "@/hooks/use-inventory";
import type { Stock } from "@/types/inventory";

export function StockLevelsTab() {
  const { data: warehouses } = useWarehouses();
  const [warehouseId, setWarehouseId] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError, refetch } = useStock({
    warehouse_id: warehouseId === "all" ? undefined : Number(warehouseId),
    page,
  });

  const columns: ColumnDef<Stock>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.product?.name ?? "-"}</div>
          <div className="text-muted-foreground text-xs">
            {row.original.variant
              ? `${row.original.variant.sku}${
                  Object.values(row.original.variant.attributes ?? {}).length
                    ? ` (${Object.values(row.original.variant.attributes).join(" / ")})`
                    : ""
                }`
              : row.original.product?.sku}
          </div>
        </div>
      ),
    },
    {
      id: "warehouse",
      header: "Warehouse",
      cell: ({ row }) => row.original.warehouse?.name ?? "-",
    },
    {
      accessorKey: "quantity",
      header: "On hand",
    },
    {
      accessorKey: "reserved_quantity",
      header: "Reserved",
    },
    {
      accessorKey: "available_quantity",
      header: "Available",
      cell: ({ row }) => (
        <span className="tabular-nums font-semibold">{row.original.available_quantity}</span>
      ),
    },
  ];

  const toolbar = (
    <div className="bg-card/50 flex items-center gap-2 rounded-xl border p-3">
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
      emptyTitle="No stock records"
      emptyDescription="Stock levels will appear here once purchases or transfers are received."
    />
  );
}
