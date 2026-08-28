"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileText, Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAdminBrands, useAdminCategories } from "@/hooks/use-admin-products";
import { useWarehouses } from "@/hooks/use-inventory";
import {
  useExportMovementReport,
  useMovementReport,
  useMovementReportThresholds,
  useUpdateMovementReportThresholds,
} from "@/hooks/use-reports";
import type {
  MovementReportGroupRow,
  MovementReportProductRow,
  MovementReportThresholds,
} from "@/lib/api/services/report.service";
import { formatCurrency } from "@/lib/format";

type BucketTab = "fast" | "slow" | "non_moving" | "all";
type GroupBy = "none" | "category" | "subcategory" | "brand";

const TAB_LABELS: Record<BucketTab, string> = {
  fast: "Fast moving",
  slow: "Slow moving",
  non_moving: "Non-moving",
  all: "All items",
};

const BUCKET_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  fast: "default",
  slow: "secondary",
  non_moving: "destructive",
};

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

function isGroupRow(
  row: MovementReportProductRow | MovementReportGroupRow
): row is MovementReportGroupRow {
  return "group_id" in row;
}

export function MovementReportContent() {
  const [tab, setTab] = React.useState<BucketTab>("fast");
  const [range, setRange] = React.useState(defaultRange);
  const [warehouseId, setWarehouseId] = React.useState<string>("all");
  const [warehouseType, setWarehouseType] = React.useState<string>("all");
  const [categoryId, setCategoryId] = React.useState<string>("all");
  const [brandId, setBrandId] = React.useState<string>("all");
  const [groupBy, setGroupBy] = React.useState<GroupBy>("none");
  const [thresholdsOpen, setThresholdsOpen] = React.useState(false);

  const { data: warehouses } = useWarehouses();
  const { data: categories } = useAdminCategories();
  const { data: brands } = useAdminBrands();

  const filters = {
    from: range.from,
    to: range.to,
    warehouse_id: warehouseId === "all" ? undefined : Number(warehouseId),
    warehouse_type:
      warehouseType === "all" ? undefined : (warehouseType as "main" | "branch" | "outlet"),
    category_id: categoryId === "all" ? undefined : Number(categoryId),
    brand_id: brandId === "all" ? undefined : Number(brandId),
    group_by: groupBy === "none" ? undefined : groupBy,
    bucket: groupBy === "none" && tab !== "all" ? tab : undefined,
  };

  const { data, isLoading, isError, refetch } = useMovementReport(filters);
  const exportReport = useExportMovementReport();

  const rows = data?.rows ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movement reports"
        description="Fast moving, slow moving, and non-moving items over a date range."
        actions={
          <Button variant="outline" onClick={() => setThresholdsOpen(true)}>
            <Settings2 className="size-4" />
            Thresholds
          </Button>
        }
      />

      {groupBy === "none" && (
        <Tabs value={tab} onValueChange={(value) => setTab(value as BucketTab)}>
          <TabsList>
            {(Object.keys(TAB_LABELS) as BucketTab[]).map((key) => (
              <TabsTrigger key={key} value={key}>
                {TAB_LABELS[key]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <Card>
        <CardContent className="grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input
              type="date"
              value={range.from}
              onChange={(event) => setRange((prev) => ({ ...prev, from: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input
              type="date"
              value={range.to}
              onChange={(event) => setRange((prev) => ({ ...prev, to: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Warehouse</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger className="w-full">
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
          <div className="space-y-1.5">
            <Label>Warehouse type</Label>
            <Select value={warehouseType} onValueChange={setWarehouseType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="main">Main warehouse</SelectItem>
                <SelectItem value="branch">Branch</SelectItem>
                <SelectItem value="outlet">Outlet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {(categories ?? []).map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Select value={brandId} onValueChange={setBrandId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {(brands ?? []).map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Group by</Label>
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Individual products</SelectItem>
                <SelectItem value="category">Category wise</SelectItem>
                <SelectItem value="subcategory">Subcategory wise</SelectItem>
                <SelectItem value="brand">Brand wise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={exportReport.isPending}
              onClick={() => exportReport.mutate({ filters, format: "excel" })}
            >
              <FileSpreadsheet className="size-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={exportReport.isPending}
              onClick={() => exportReport.mutate({ filters, format: "pdf" })}
            >
              <FileText className="size-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={exportReport.isPending}
              onClick={() => exportReport.mutate({ filters, format: "word" })}
            >
              <Download className="size-4" />
              Word
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-eyebrow text-muted-foreground">Preview</p>
          <CardTitle className="text-display text-lg">
            {groupBy === "none" ? TAB_LABELS[tab] : `Grouped by ${groupBy}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title="No data for this period" className="border-none" />
          ) : groupBy !== "none" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{groupBy === "brand" ? "Brand" : "Category"}</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Qty sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Fast</TableHead>
                  <TableHead className="text-right">Slow</TableHead>
                  <TableHead className="text-right">Non-moving</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.filter(isGroupRow).map((row) => (
                  <TableRow key={row.group_id ?? "uncategorized"}>
                    <TableCell className="font-medium">{row.group_name}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.products_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.qty_sold}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.revenue)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.fast_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.slow_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.non_moving_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Qty sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.filter((row): row is MovementReportProductRow => !isGroupRow(row)).map((row) => (
                  <TableRow key={row.product_id}>
                    <TableCell>
                      <div className="font-medium">{row.product_name}</div>
                      <div className="text-muted-foreground text-xs">{row.sku}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.category_name ?? "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {row.brand_name ?? "-"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.qty_sold}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.revenue)}
                    </TableCell>
                    <TableCell>
                      {row.bucket ? (
                        <Badge variant={BUCKET_BADGE_VARIANT[row.bucket] ?? "outline"}>
                          {TAB_LABELS[row.bucket]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Normal</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ThresholdsDialog open={thresholdsOpen} onOpenChange={setThresholdsOpen} />
    </div>
  );
}

function ThresholdsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: thresholds } = useMovementReportThresholds();
  const updateThresholds = useUpdateMovementReportThresholds();

  const [form, setForm] = React.useState<MovementReportThresholds | null>(null);

  React.useEffect(() => {
    if (thresholds && !form) setForm(thresholds);
  }, [thresholds, form]);

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Movement thresholds</DialogTitle>
          <DialogDescription>
            Choose how products are classified as fast, slow, or non-moving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Classification mode</Label>
            <Select
              value={form.mode}
              onValueChange={(value) => setForm({ ...form, mode: value as "percentile" | "fixed" })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentile">Percentile ranking</SelectItem>
                <SelectItem value="fixed">Fixed quantity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.mode === "percentile" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fast moving — top %</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.fast_percentile}
                  onChange={(event) =>
                    setForm({ ...form, fast_percentile: Number(event.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slow moving — bottom %</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.slow_percentile}
                  onChange={(event) =>
                    setForm({ ...form, slow_percentile: Number(event.target.value) })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Fast moving — qty ≥</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.fast_qty_threshold}
                  onChange={(event) =>
                    setForm({ ...form, fast_qty_threshold: Number(event.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slow moving — qty ≤</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.slow_qty_threshold}
                  onChange={(event) =>
                    setForm({ ...form, slow_qty_threshold: Number(event.target.value) })
                  }
                />
              </div>
            </div>
          )}
          <p className="text-muted-foreground text-xs">
            Products with zero sales in the selected period are always classified as non-moving.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            disabled={updateThresholds.isPending}
            onClick={() =>
              updateThresholds.mutate(form, { onSuccess: () => onOpenChange(false) })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
