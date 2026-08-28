"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Mail, Phone } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useUsers } from "@/hooks/use-users";
import { formatDate, getInitials } from "@/lib/format";
import type { User } from "@/types/user";

export function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = useUsers(page);
  const [selected, setSelected] = React.useState<User | undefined>(undefined);

  const customers = React.useMemo(
    () => (data?.data ?? []).filter((user) => user.roles?.includes("customer")),
    [data]
  );

  function goToPage(next: number) {
    router.push(`/admin/customers?page=${next}`);
  }

  const columns: ColumnDef<User>[] = [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <Avatar className="ring-border/60 ring-1">
          {row.original.avatar && <AvatarImage src={row.original.avatar} alt={row.original.name} />}
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(row.original.name)}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      id: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "joined",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{formatDate(row.original.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="animate-in-fade-up space-y-6">
      <PageHeader
        title="Customers"
        description="Registered storefront customers. Customers self-register — this list is read-only."
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={customers}
          meta={data?.meta}
          onPageChange={goToPage}
          isLoading={isLoading}
          onRowClick={(user) => setSelected(user)}
          emptyTitle="No customers found"
          emptyDescription="Customers will appear here once they register on the storefront."
        />
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(undefined)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Customer details</DialogTitle>
            <DialogDescription>Basic account information.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="ring-primary/10 size-12 ring-2">
                  {selected.avatar && <AvatarImage src={selected.avatar} alt={selected.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-medium">
                    {getInitials(selected.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium">{selected.name}</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>
              <div className="bg-muted/30 space-y-2.5 rounded-lg border p-3.5 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground size-4" />
                  {selected.email}
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="text-muted-foreground size-4" />
                    {selected.phone}
                  </div>
                )}
                <p className="text-muted-foreground text-xs">
                  Joined {formatDate(selected.created_at)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
