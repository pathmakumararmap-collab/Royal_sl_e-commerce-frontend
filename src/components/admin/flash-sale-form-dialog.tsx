"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Flame } from "lucide-react";
import type { z } from "zod";

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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
import { ProductPicker } from "@/components/admin/coupon-pickers";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/use-coupons";
import { couponSchema, type CouponFormValues } from "@/lib/validators/coupon";
import type { Coupon, CouponInput } from "@/types/coupon";

type CouponFormInput = z.input<typeof couponSchema>;

interface FlashSaleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon;
}

function defaultValuesFor(coupon: Coupon | undefined): CouponFormInput {
  return {
    code: coupon?.code ?? "",
    type: coupon?.type ?? "percentage",
    value: coupon?.value ?? 0,
    min_order_amount: coupon?.min_order_amount ?? undefined,
    max_discount_amount: coupon?.max_discount_amount ?? undefined,
    usage_limit: coupon?.usage_limit ?? undefined,
    usage_limit_per_user: coupon?.usage_limit_per_user ?? undefined,
    starts_at: coupon?.starts_at ? coupon.starts_at.slice(0, 10) : "",
    expires_at: coupon?.expires_at ? coupon.expires_at.slice(0, 10) : "",
    is_active: coupon?.is_active ?? true,
    applicable_to: "product",
    product_ids: [],
    category_ids: [],
  };
}

/**
 * Flash sales are coupons with applicable_to hardcoded to "product" and a
 * short validity window. This is a trimmed version of the full coupon form
 * (no min-order/usage-limit fields) — see coupon-form-dialog.tsx for the
 * full-featured form used on the Coupons page.
 */
export function FlashSaleFormDialog({ open, onOpenChange, coupon }: FlashSaleFormDialogProps) {
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const isEditing = !!coupon;

  const form = useForm<CouponFormInput, unknown, CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: defaultValuesFor(coupon),
  });

  React.useEffect(() => {
    if (open) {
      form.reset(defaultValuesFor(coupon));
    }
  }, [open, coupon, form]);

  const isPending = createCoupon.isPending || updateCoupon.isPending;

  const onSubmit = (values: CouponFormValues) => {
    if (!values.product_ids?.length) {
      form.setError("product_ids", { message: "Select at least one product." });
      return;
    }
    if (!values.starts_at) {
      form.setError("starts_at", { message: "Sale start date is required." });
      return;
    }
    if (!values.expires_at) {
      form.setError("expires_at", { message: "Sale end date is required." });
      return;
    }

    const input: CouponInput = {
      code: values.code,
      type: values.type,
      value: values.value,
      starts_at: values.starts_at || undefined,
      expires_at: values.expires_at || undefined,
      is_active: values.is_active,
      applicable_to: "product",
      product_ids: values.product_ids,
    };

    if (isEditing) {
      updateCoupon.mutate(
        { id: coupon.id, input },
        { onSuccess: () => onOpenChange(false) }
      );
      return;
    }

    createCoupon.mutate(input, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset(defaultValuesFor(undefined));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="text-accent size-5" />
            {isEditing ? "Edit flash sale" : "New flash sale"}
          </DialogTitle>
          <DialogDescription>
            Flash sales are short, product-specific coupons. Pick the products on sale and the
            window they&rsquo;re discounted for.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="FLASH24" className="font-mono uppercase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Discount type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Discount value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        value={(field.value as number | string | undefined) ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="col-span-2 flex flex-row items-center gap-2 sm:col-span-1 sm:self-end sm:pb-1.5">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <Label className="font-normal">Active</Label>
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="starts_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale starts</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale ends</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="product_ids"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Products on sale</FormLabel>
                    <FormControl>
                      <ProductPicker
                        selected={field.value ?? []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={isPending}>
                {isPending ? "Saving…" : "Save flash sale"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
