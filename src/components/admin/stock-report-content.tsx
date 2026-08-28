"use client";

import * as React from "react";
import { AlertTriangle, Boxes } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useWarehouses } from "@/hooks/use-inventory";
import { useStockReport } from "@/hooks/use-reports";
import { formatDateTime, formatOrderStatus } from "@/lib/format";
import { cn } from "@/lib/utils";

export function StockReportContent() {
  const { data: warehouses } = useWarehouses();
  const [warehouseId, setWarehouseId] = React.useState<string>("all");

  const { data, isLoading, isError, refetch } = useStockReport({
    warehouse_id: warehouseId === "all" ? undefined : Number(warehouseId),
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Stock report" description="A snapshot of stock on hand and recent activity." />

      <Card>
        <CardContent className="flex flex-wrap items-end gap-4 py-4">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-sm font-medium">Warehouse</p>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
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
        </CardContent>
      </Card>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="stagger-children grid gap-4 sm:grid-cols-2">
            <StatCard label="Total units on hand" value={data.total_units.toLocaleString()} icon={Boxes} />
            <StatCard
              label="Low stock items"
              value={data.low_stock_count.toLocaleString()}
              icon={AlertTriangle}
            />
          </div>

          <Card>
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Attention needed</p>
              <CardTitle className="text-display text-lg">Low stock items</CardTitle>
            </CardHeader>
            <CardContent>
              {data.low_stock_items.length === 0 ? (
                <EmptyState title="No low stock items" className="border-none" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">On hand</TableHead>
                      <TableHead className="text-right">Available</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.low_stock_items.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell>
                          <div className="font-medium">{stock.product?.name ?? "-"}</div>
                          <div className="text-muted-foreground text-xs">{stock.product?.sku}</div>
                        </TableCell>
                        <TableCell>{stock.warehouse?.name ?? "-"}</TableCell>
                        <TableCell className="text-right tabular-nums">{stock.quantity}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-destructive font-medium tabular-nums">
                            {stock.available_quantity}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Activity</p>
              <CardTitle className="text-display text-lg">Recent movements</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recent_movements.length === 0 ? (
                <EmptyState title="No recent movements" className="border-none" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recent_movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{movement.product?.name ?? "-"}</TableCell>
                        <TableCell>{movement.warehouse?.name ?? "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatOrderStatus(movement.type)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "font-mono font-medium tabular-nums",
                              movement.quantity_change >= 0 ? "text-success" : "text-destructive"
                            )}
                          >
                            {movement.quantity_change >= 0
                              ? `+${movement.quantity_change}`
                              : movement.quantity_change}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateTime(movement.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
