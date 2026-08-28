"use client";

import * as React from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressFormDialog } from "@/components/customer/address-form-dialog";
import { useAddresses, useDeleteAddress } from "@/hooks/use-addresses";
import type { Address } from "@/types/user";

export function AddressesContent() {
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const deleteAddress = useDeleteAddress();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Address | undefined>(undefined);

  function openCreate() {
    setEditingAddress(undefined);
    setFormOpen(true);
  }

  function openEdit(address: Address) {
    setEditingAddress(address);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My addresses"
        description="Manage the shipping and billing addresses used at checkout."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add address
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !addresses?.length ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Add an address to speed up checkout next time."
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              Add address
            </Button>
          }
        />
      ) : (
        <div className="stagger-children grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={cn(
                "hover-lift-sm",
                address.is_default && "border-primary/30 shadow-luxury-sm"
              )}
            >
              <CardContent className="space-y-3.5 py-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <MapPin className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium">{address.recipient_name}</p>
                      {address.label && (
                        <p className="text-muted-foreground text-xs">{address.label}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant="outline" className="capitalize">
                      {address.type}
                    </Badge>
                    {address.is_default && (
                      <Badge className="bg-gradient-gold text-accent-foreground gap-1 border-0">
                        <Star className="size-3" />
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-muted-foreground border-border/60 border-t pt-3 text-sm">
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>
                    {address.city}
                    {address.postal_code ? `, ${address.postal_code}` : ""}
                  </p>
                  <p>{address.phone}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(address)}>
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDeleteTarget(address)}>
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddressFormDialog open={formOpen} onOpenChange={setFormOpen} address={editingAddress} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(undefined)}
        title="Remove this address?"
        description="This address will be removed from your account permanently."
        confirmLabel="Remove"
        loading={deleteAddress.isPending}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAddress.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(undefined) });
          }
        }}
      />
    </div>
  );
}
