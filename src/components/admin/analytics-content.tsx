"use client";

import * as React from "react";
import { CalendarRange, CircleDollarSign, Receipt, ShoppingCart, Wallet } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Currency } from "@/components/shared/currency";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useOrderReport, useProductReport, useSalesReport } from "@/hooks/use-reports";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const salesChartConfig = {
  total_sales: {
    label: "Sales",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const sourceChartConfig = {
  total_sales: {
    label: "Sales",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function AnalyticsContent() {
  const today = React.useMemo(() => new Date(), []);
  const defaultTo = toIsoDate(today);
  const defaultFrom = toIsoDate(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));

  const [from, setFrom] = React.useState(defaultFrom);
  const [to, setTo] = React.useState(defaultTo);

  const filters = { from, to };

  const salesReport = useSalesReport(filters);
  const orderReport = useOrderReport(filters);
  const productReport = useProductReport(filters);

  const salesChartData = (salesReport.data?.by_day ?? []).map((day) => ({
    date: formatDate(day.date),
    total_sales: Number(day.total_sales),
    orders_count: day.orders_count,
  }));

  const sourceChartData = (salesReport.data?.by_source ?? []).map((source) => ({
    source: source.source,
    total_sales: Number(source.total_sales),
    orders_count: source.orders_count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Sales, orders, and product performance over time." />

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="text-muted-foreground hidden items-center gap-2 text-sm font-medium sm:flex">
            <CalendarRange className="size-4" />
            Date range
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="analytics-from">From</Label>
            <Input
              id="analytics-from"
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              className="w-full sm:w-44"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="analytics-to">To</Label>
            <Input
              id="analytics-to"
              type="date"
              value={to}
              min={from}
              max={defaultTo}
              onChange={(event) => setTo(event.target.value)}
              className="w-full sm:w-44"
            />
          </div>
        </CardContent>
      </Card>

      {salesReport.isError ? (
        <ErrorState onRetry={() => salesReport.refetch()} />
      ) : (
        <>
          <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total orders"
              value={
                salesReport.data ? formatNumber(salesReport.data.summary.total_orders) : "…"
              }
              icon={ShoppingCart}
            />
            <StatCard
              label="Total sales"
              value={
                salesReport.data ? formatCurrency(salesReport.data.summary.total_sales) : "…"
              }
              icon={CircleDollarSign}
            />
            <StatCard
              label="Collected"
              value={
                salesReport.data ? formatCurrency(salesReport.data.summary.total_collected) : "…"
              }
              icon={Wallet}
            />
            <StatCard
              label="Average order value"
              value={
                salesReport.data
                  ? formatCurrency(salesReport.data.summary.average_order_value)
                  : "…"
              }
              icon={Receipt}
            />
          </div>

          <Card>
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Trend</p>
              <CardTitle className="text-display text-lg">Sales over time</CardTitle>
            </CardHeader>
            <CardContent>
              {salesChartData.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  No sales in this date range.
                </p>
              ) : (
                <ChartContainer config={salesChartConfig} className="h-72 w-full">
                  <AreaChart data={salesChartData} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area
                      dataKey="total_sales"
                      type="monotone"
                      fill="var(--color-total_sales)"
                      fillOpacity={0.2}
                      stroke="var(--color-total_sales)"
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <p className="text-eyebrow text-muted-foreground">Breakdown</p>
                <CardTitle className="text-display text-lg">Sales by source</CardTitle>
              </CardHeader>
              <CardContent>
                {sourceChartData.length === 0 ? (
                  <p className="text-muted-foreground py-10 text-center text-sm">No data.</p>
                ) : (
                  <ChartContainer config={sourceChartConfig} className="h-64 w-full">
                    <BarChart data={sourceChartData} margin={{ left: 8, right: 8 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="source" tickLine={false} axisLine={false} tickMargin={8} className="capitalize" />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total_sales" fill="var(--color-total_sales)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <p className="text-eyebrow text-muted-foreground">Breakdown</p>
                <CardTitle className="text-display text-lg">Orders by status</CardTitle>
              </CardHeader>
              <CardContent>
                {orderReport.isLoading ? (
                  <p className="text-muted-foreground py-10 text-center text-sm">Loading…</p>
                ) : !orderReport.data?.by_status.length ? (
                  <p className="text-muted-foreground py-10 text-center text-sm">No data.</p>
                ) : (
                  <div className="space-y-3">
                    {orderReport.data.by_status.map((entry) => (
                      <div
                        key={entry.status}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <StatusBadge status={entry.status} />
                        <span className="tabular-nums text-sm font-semibold">
                          {formatNumber(entry.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Performance</p>
              <CardTitle className="text-display text-lg">Top selling products</CardTitle>
            </CardHeader>
            <CardContent>
              {productReport.isLoading ? (
                <p className="text-muted-foreground py-10 text-center text-sm">Loading…</p>
              ) : !productReport.data?.top_selling.length ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  No sales recorded in this range.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Units sold</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productReport.data.top_selling.map((product) => (
                        <TableRow key={product.product_id}>
                          <TableCell className="font-medium">{product.product_name}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{formatNumber(product.units_sold)}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Currency value={product.revenue} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
