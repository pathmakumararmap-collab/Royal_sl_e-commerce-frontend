"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateAddress, useUpdateAddress } from "@/hooks/use-addresses";
import { addressSchema, type AddressFormValues } from "@/lib/validators/address";
import type { Address } from "@/types/user";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address;
  onSaved?: (address: Address) => void;
}

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSaved,
}: AddressFormDialogProps) {
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const isEditing = !!address;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? "",
      recipient_name: address?.recipient_name ?? "",
      phone: address?.phone ?? "",
      address_line1: address?.address_line1 ?? "",
      address_line2: address?.address_line2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postal_code: address?.postal_code ?? "",
      country: address?.country ?? "Sri Lanka",
      type: address?.type ?? "shipping",
      is_default: address?.is_default ?? false,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        label: address?.label ?? "",
        recipient_name: address?.recipient_name ?? "",
        phone: address?.phone ?? "",
        address_line1: address?.address_line1 ?? "",
        address_line2: address?.address_line2 ?? "",
        city: address?.city ?? "",
        state: address?.state ?? "",
        postal_code: address?.postal_code ?? "",
        country: address?.country ?? "Sri Lanka",
        type: address?.type ?? "shipping",
        is_default: address?.is_default ?? false,
      });
    }
  }, [open, address, form]);

  const isPending = createAddress.isPending || updateAddress.isPending;

  const onSubmit = (values: AddressFormValues) => {
    if (isEditing) {
      updateAddress.mutate(
        { id: address.id, input: values },
        {
          onSuccess: (saved) => {
            onOpenChange(false);
            onSaved?.(saved);
          },
        }
      );
      return;
    }

    createAddress.mutate(values, {
      onSuccess: (saved) => {
        onOpenChange(false);
        onSaved?.(saved);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit address" : "Add a new address"}</DialogTitle>
          <DialogDescription>
            This address will be available for shipping and billing on future orders.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recipient_name"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Recipient name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="077 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Label (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Home, Office, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_line1"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="No. 10, Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_line2"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Address line 2 (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apartment, suite, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Colombo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code</FormLabel>
                    <FormControl>
                      <Input placeholder="00300" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem className="border-border/60 bg-muted/30 flex flex-row items-center gap-2.5 self-end rounded-lg border px-3 py-2.5">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Set as default</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save address"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
