"use client";

import * as React from "react";
import { CircleDollarSign, Receipt, ShoppingCart, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useSalesReport } from "@/hooks/use-reports";
import { formatCurrency, formatDate, formatOrderStatus } from "@/lib/format";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

const chartConfig: ChartConfig = {
  total_sales: {
    label: "Sales",
    color: "var(--color-chart-1)",
  },
};

export function SalesReportContent() {
  const [range, setRange] = React.useState(defaultRange);
  const { data, isLoading, isError, refetch } = useSalesReport(range);

  const chartData = (data?.by_day ?? []).map((day) => ({
    date: day.date,
    total_sales: Number(day.total_sales),
    orders_count: day.orders_count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales report"
        description="Order volume and revenue collected over the selected period."
      />

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sales-from">From</Label>
          <Input
            id="sales-from"
            type="date"
            value={range.from}
            max={range.to}
            onChange={(event) => setRange((prev) => ({ ...prev, from: event.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sales-to">To</Label>
          <Input
            id="sales-to"
            type="date"
            value={range.to}
            min={range.from}
            onChange={(event) => setRange((prev) => ({ ...prev, to: event.target.value }))}
          />
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total orders"
              value={data.summary.total_orders.toLocaleString()}
              icon={ShoppingCart}
            />
            <StatCard
              label="Total sales"
              value={formatCurrency(data.summary.total_sales)}
              icon={CircleDollarSign}
            />
            <StatCard
              label="Average order value"
              value={formatCurrency(data.summary.average_order_value)}
              icon={Receipt}
            />
            <StatCard
              label="Total collected"
              value={formatCurrency(data.summary.total_collected)}
              icon={Wallet}
            />
          </div>

          <Card>
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Trend</p>
              <CardTitle className="text-display text-lg">Sales by day</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <EmptyState title="No sales in this period" className="border-none" />
              ) : (
                <ChartContainer config={chartConfig} className="h-72 w-full">
                  <AreaChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={24}
                      tickFormatter={(value: string) => formatDate(value)}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => formatDate(String(value))}
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <Area
                      dataKey="total_sales"
                      type="monotone"
                      fill="var(--color-total_sales)"
                      fillOpacity={0.2}
                      stroke="var(--color-total_sales)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Breakdown</p>
              <CardTitle className="text-display text-lg">Sales by source</CardTitle>
            </CardHeader>
            <CardContent>
              {data.by_source.length === 0 ? (
                <EmptyState title="No source breakdown available" className="border-none" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Total sales</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.by_source.map((row) => (
                      <TableRow key={row.source}>
                        <TableCell>{formatOrderStatus(row.source)}</TableCell>
                        <TableCell className="text-right">{row.orders_count}</TableCell>
                        <TableCell className="text-right">
                          <Currency value={row.total_sales} />
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
