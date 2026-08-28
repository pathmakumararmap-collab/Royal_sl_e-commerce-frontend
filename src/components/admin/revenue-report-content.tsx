"use client";

import * as React from "react";
import { CircleDollarSign, Percent, Receipt, Truck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Currency } from "@/components/shared/currency";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useSalesReport } from "@/hooks/use-reports";
import { formatCurrency, formatDate } from "@/lib/format";

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-4)",
  "var(--color-chart-2)",
  "var(--color-chart-5)",
];

const chartConfig: ChartConfig = {
  amount: { label: "Amount" },
};

export function RevenueReportContent() {
  const [range, setRange] = React.useState(defaultRange);
  const { data, isLoading, isError, refetch } = useSalesReport(range);

  const breakdown = data
    ? [
        { name: "Net sales", amount: Number(data.summary.total_sales) },
        { name: "Discounts", amount: Number(data.summary.total_discount) },
        { name: "Tax collected", amount: Number(data.summary.total_tax) },
        { name: "Shipping", amount: Number(data.summary.total_shipping) },
      ]
    : [];

  const trend = (data?.by_day ?? []).map((day) => ({
    date: day.date,
    total_sales: Number(day.total_sales),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue report"
        description="How gross sales break down into discounts, tax, and shipping over the selected period."
      />

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="revenue-from">From</Label>
          <Input
            id="revenue-from"
            type="date"
            value={range.from}
            max={range.to}
            onChange={(event) => setRange((prev) => ({ ...prev, from: event.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="revenue-to">To</Label>
          <Input
            id="revenue-to"
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
              label="Net sales"
              value={formatCurrency(data.summary.total_sales)}
              icon={CircleDollarSign}
            />
            <StatCard
              label="Discounts given"
              value={formatCurrency(data.summary.total_discount)}
              icon={Percent}
            />
            <StatCard
              label="Tax collected"
              value={formatCurrency(data.summary.total_tax)}
              icon={Receipt}
            />
            <StatCard
              label="Shipping charged"
              value={formatCurrency(data.summary.total_shipping)}
              icon={Truck}
            />
          </div>

          <Card>
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Breakdown</p>
              <CardTitle className="text-display text-lg">Revenue composition</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-72 w-full">
                <BarChart data={breakdown}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {breakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {breakdown.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="hover-lift-sm flex items-center justify-between rounded-lg border p-3.5 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      {entry.name}
                    </div>
                    <Currency value={entry.amount} className="font-medium" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Trend</p>
              <CardTitle className="text-display text-lg">Net sales trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ total_sales: { label: "Net sales", color: "var(--color-chart-1)" } }} className="h-56 w-full">
                <BarChart data={trend}>
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
                  <Bar dataKey="total_sales" fill="var(--color-total_sales)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
