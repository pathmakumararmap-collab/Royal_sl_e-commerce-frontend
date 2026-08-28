"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Currency } from "@/components/shared/currency";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useAdminOrders, useDownloadInvoice, useGenerateInvoice } from "@/hooks/use-orders";
import { formatDate } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "returned",
];

export function InvoicesListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);
  const status = (searchParams.get("status") as OrderStatus | null) ?? undefined;

  const { data, isLoading, isError, refetch } = useAdminOrders({ status, page, per_page: 15 });
  const generateInvoice = useGenerateInvoice();
  const downloadInvoice = useDownloadInvoice();

  function updateParams(next: Partial<Record<string, string | number | undefined>>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    if (!("page" in next)) params.delete("page");
    router.push(`/admin/invoices?${params.toString()}`);
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "order_no",
      header: "Order",
      cell: ({ row }) => (
        <Link
          href={`/admin/orders/${row.original.id}`}
          className="hover:text-primary font-medium tracking-tight transition-colors"
        >
          {row.original.order_no}
        </Link>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => row.original.customer_name ?? row.original.user?.name ?? "—",
    },
    {
      id: "order_date",
      header: "Order date",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "invoice_no",
      header: "Invoice #",
      cell: ({ row }) => row.original.invoice?.invoice_no ?? <span className="text-muted-foreground">Not generated</span>,
    },
    {
      id: "issued_at",
      header: "Issued",
      cell: ({ row }) => (row.original.invoice ? formatDate(row.original.invoice.issued_at) : "—"),
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => (
        <Currency value={row.original.invoice?.total_amount ?? row.original.total_amount} />
      ),
    },
    {
      id: "invoice_status",
      header: "Status",
      cell: ({ row }) =>
        row.original.invoice ? (
          <Badge variant="secondary" className="capitalize">
            {row.original.invoice.status}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const order = row.original;
        return order.invoice ? (
          <Button
            variant="outline"
            size="sm"
            disabled={downloadInvoice.isPending}
            onClick={() => downloadInvoice.mutate({ id: order.invoice!.id, invoiceNo: order.invoice!.invoice_no })}
          >
            <Download className="size-3.5" />
            Download
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={generateInvoice.isPending}
            onClick={() => generateInvoice.mutate(order.id)}
          >
            <FileText className="size-3.5" />
            Generate
          </Button>
        );
      },
    },
  ];

  return (
    <div className="animate-in-fade-up space-y-6">
      <PageHeader
        title="Invoices"
        description="Generate and download invoices for orders."
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          meta={data?.meta}
          onPageChange={(next) => updateParams({ page: next })}
          isLoading={isLoading}
          emptyTitle="No orders found"
          emptyDescription="Try adjusting the status filter."
          toolbar={
            <div className="bg-card/50 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center">
              <Select
                value={status ?? "all"}
                onValueChange={(value) => updateParams({ status: value === "all" ? undefined : value })}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {ORDER_STATUSES.map((value) => (
                    <SelectItem key={value} value={value} className="capitalize">
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
      )}
    </div>
  );
}
