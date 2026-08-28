"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { CategoryPicker, ProductPicker } from "@/components/admin/coupon-pickers";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/use-coupons";
import { couponSchema, type CouponFormValues } from "@/lib/validators/coupon";
import type { Coupon, CouponInput } from "@/types/coupon";

type CouponFormInput = z.input<typeof couponSchema>;

interface CouponFormDialogProps {
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
    applicable_to: coupon?.applicable_to ?? "all",
    product_ids: [],
    category_ids: [],
  };
}

export function CouponFormDialog({ open, onOpenChange, coupon }: CouponFormDialogProps) {
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

  const applicableTo = form.watch("applicable_to");
  const isPending = createCoupon.isPending || updateCoupon.isPending;

  const onSubmit = (values: CouponFormValues) => {
    const input: CouponInput = {
      code: values.code,
      type: values.type,
      value: values.value,
      min_order_amount: values.min_order_amount,
      max_discount_amount: values.max_discount_amount ?? undefined,
      usage_limit: values.usage_limit ?? undefined,
      usage_limit_per_user: values.usage_limit_per_user ?? undefined,
      starts_at: values.starts_at || undefined,
      expires_at: values.expires_at || undefined,
      is_active: values.is_active,
      applicable_to: values.applicable_to,
      product_ids: values.applicable_to === "product" ? values.product_ids : undefined,
      category_ids: values.applicable_to === "category" ? values.category_ids : undefined,
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit coupon" : "New coupon"}</DialogTitle>
          <DialogDescription>
            Coupons can be restricted to specific products or categories and given usage limits.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="max-h-[65vh] space-y-6 overflow-y-auto px-0.5 py-0.5 pr-1.5">
              <div className="space-y-4">
                <p className="text-eyebrow text-muted-foreground">Basics</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-1">
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="SAVE10" className="font-mono uppercase" {...field} />
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
                      <FormItem>
                        <FormLabel>Value</FormLabel>
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
                    name="min_order_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min. order amount</FormLabel>
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
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-eyebrow text-muted-foreground">Limits &amp; validity</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="max_discount_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max. discount (optional)</FormLabel>
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
                    name="usage_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage limit (total)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
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
                    name="usage_limit_per_user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage limit (per user)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
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
                  <div className="hidden sm:block" />
                  <FormField
                    control={form.control}
                    name="starts_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starts at</FormLabel>
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
                        <FormLabel>Expires at</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <p className="text-eyebrow text-muted-foreground">Applies to</p>
                <FormField
                  control={form.control}
                  name="applicable_to"
                  render={({ field }) => (
                    <FormItem>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All products</SelectItem>
                          <SelectItem value="category">Specific categories</SelectItem>
                          <SelectItem value="product">Specific products</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {applicableTo === "product" && (
                  <FormField
                    control={form.control}
                    name="product_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Products</FormLabel>
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
                )}

                {applicableTo === "category" && (
                  <FormField
                    control={form.control}
                    name="category_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <FormControl>
                          <CategoryPicker
                            selected={field.value ?? []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="bg-muted/40 flex flex-row items-center justify-between rounded-xl border px-4 py-3">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Active</Label>
                      <p className="text-muted-foreground text-xs">
                        Inactive coupons cannot be redeemed at checkout.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save coupon"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
