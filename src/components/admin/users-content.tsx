"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { useDeleteUser, useUsers } from "@/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";
import { getInitials } from "@/lib/format";
import type { User } from "@/types/user";

const STATUS_VARIANT: Record<User["status"], "success" | "secondary" | "destructive"> = {
  active: "success",
  inactive: "secondary",
  banned: "destructive",
};

export function UsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? 1);

  const { data, isLoading, isError, refetch } = useUsers(page);
  const deleteUser = useDeleteUser();
  const currentUser = useAuthStore((state) => state.user);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<User | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<User | undefined>(undefined);

  function goToPage(next: number) {
    router.push(`/admin/users?page=${next}`);
  }

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setFormOpen(true);
  }

  const columns: ColumnDef<User>[] = [
    {
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="text-muted-foreground truncate text-xs">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "—",
    },
    {
      id: "roles",
      header: "Roles",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles?.length ? (
            row.original.roles.map((role) => (
              <Badge key={role} variant="outline" className="capitalize">
                {role.replace(/_/g, " ")}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]} className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = currentUser?.id === user.id;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-primary/10 hover:text-primary"
              onClick={(event) => {
                event.stopPropagation();
                openEdit(user);
              }}
              aria-label="Edit user"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="hover:bg-destructive/10 hover:text-destructive"
              disabled={isSelf}
              title={isSelf ? "You cannot delete your own account" : undefined}
              onClick={(event) => {
                event.stopPropagation();
                setDeleteTarget(user);
              }}
              aria-label="Delete user"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage staff accounts, roles, and access."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New user
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        onPageChange={goToPage}
        isLoading={isLoading}
        emptyTitle="No users found"
        emptyDescription="Create a staff account to get started."
      />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Delete user?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteUser.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteUser.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(undefined),
          });
        }}
      />
    </div>
  );
}
