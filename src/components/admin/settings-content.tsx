"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreditCard, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { usePaymentMethods } from "@/hooks/use-orders";
import { paymentMethodService } from "@/lib/api/services/order.service";
import { queryKeys } from "@/lib/query-keys";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { PaymentMethod, PaymentMethodCode } from "@/types/payment";

const PAYMENT_CODES: { value: PaymentMethodCode; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "cod", label: "Cash on delivery" },
  { value: "online_gateway", label: "Online gateway" },
];

function useTogglePaymentMethodActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      paymentMethodService.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
      toast.success("Payment method updated.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; code: string; is_active?: boolean }) =>
      paymentMethodService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.paymentMethods.all });
      toast.success("Payment method created.");
    },
    onError: (error: ApiError) => toast.error(error.message),
  });
}

function NewPaymentMethodDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createPaymentMethod = useCreatePaymentMethod();
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState<PaymentMethodCode>("cash");
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setName("");
      setCode("cash");
      setIsActive(true);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New payment method</DialogTitle>
          <DialogDescription>
            Add a payment option that can be used at checkout and in POS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="pm-name">Name</Label>
            <Input
              id="pm-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Cash on Delivery"
            />
          </div>
          <div className="space-y-2">
            <Label>Code</Label>
            <Select value={code} onValueChange={(value) => setCode(value as PaymentMethodCode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_CODES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-muted/40 flex items-center justify-between rounded-xl border px-4 py-3">
            <Label className="font-medium">Active</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!name.trim() || createPaymentMethod.isPending}
            onClick={() => {
              createPaymentMethod.mutate(
                { name: name.trim(), code, is_active: isActive },
                { onSuccess: () => onOpenChange(false) }
              );
            }}
          >
            {createPaymentMethod.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsContent() {
  const { data: paymentMethods, isLoading, isError, refetch } = usePaymentMethods();
  const toggleActive = useTogglePaymentMethodActive();
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure store-wide settings such as accepted payment methods."
      />

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2.5">
              <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
                <CreditCard className="size-4.5" />
              </span>
              <span>
                <span className="block leading-tight">Payment methods</span>
                <span className="text-muted-foreground text-xs font-normal">
                  Available at checkout and in POS
                </span>
              </span>
            </span>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              New payment method
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <div className="space-y-2 py-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !paymentMethods?.length ? (
            <EmptyState
              icon={CreditCard}
              title="No payment methods yet"
              description="Add a payment method to make it available at checkout and in POS."
            />
          ) : (
            <div className="divide-y">
              {paymentMethods.map((method: PaymentMethod) => (
                <div key={method.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        method.is_active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <CreditCard className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{method.name}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {method.code}
                        </Badge>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            method.is_active ? "text-success" : "text-muted-foreground"
                          )}
                        >
                          {method.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={method.is_active}
                    disabled={toggleActive.isPending}
                    onCheckedChange={(checked) =>
                      toggleActive.mutate({ id: method.id, is_active: checked })
                    }
                    aria-label={`Toggle ${method.name} active state`}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NewPaymentMethodDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
