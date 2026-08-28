"use client";

import * as React from "react";
import { Check, CheckCircle2, ChevronsUpDown, Minus, Plus, Printer, ScanBarcode, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Currency } from "@/components/shared/currency";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderReceipt } from "@/components/shared/order-receipt";
import { PageHeader } from "@/components/shared/page-header";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { usePaymentMethods } from "@/hooks/use-orders";
import { useWarehouses } from "@/hooks/use-inventory";
import { useBarcodeLookup, usePosCheckout } from "@/hooks/use-pos";
import type { PosCheckoutResult } from "@/lib/api/services/pos.service";
import { cn } from "@/lib/utils";
import { posCheckoutSchema } from "@/lib/validators/pos";
import type { Product } from "@/types/catalog";

interface CartLine {
  product: Product;
  quantity: number;
}

export function PosTerminalContent() {
  const { data: warehouses } = useWarehouses();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: products } = useAdminProducts({ per_page: 50, sort: "name" });
  const barcodeLookup = useBarcodeLookup();
  const posCheckout = usePosCheckout();

  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [barcode, setBarcode] = React.useState("");
  const [productSearchOpen, setProductSearchOpen] = React.useState(false);

  const [warehouseId, setWarehouseId] = React.useState<string>("");
  const [paymentMethodId, setPaymentMethodId] = React.useState<string>("");
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [couponCode, setCouponCode] = React.useState("");
  const [amountTendered, setAmountTendered] = React.useState("");
  const [formError, setFormError] = React.useState<string | undefined>(undefined);

  const [receipt, setReceipt] = React.useState<PosCheckoutResult | undefined>(undefined);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((line) => line.product.id === product.id);
      if (existing) {
        return prev.map((line) =>
          line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((line) =>
          line.product.id === productId
            ? { ...line, quantity: Math.max(0, line.quantity + delta) }
            : line
        )
        .filter((line) => line.quantity > 0)
    );
  }

  function removeLine(productId: number) {
    setCart((prev) => prev.filter((line) => line.product.id !== productId));
  }

  function handleBarcodeSubmit(event: React.FormEvent) {
    event.preventDefault();
    const code = barcode.trim();
    if (!code) return;

    barcodeLookup.mutate(code, {
      onSuccess: (product) => {
        addToCart(product);
        setBarcode("");
      },
    });
  }

  const subtotal = cart.reduce(
    (sum, line) => sum + Number(line.product.current_price) * line.quantity,
    0
  );

  function resetForm() {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCouponCode("");
    setAmountTendered("");
    setFormError(undefined);
  }

  function handleCheckout() {
    setFormError(undefined);

    if (cart.length === 0) {
      setFormError("Add at least one item to the cart before completing the sale.");
      return;
    }

    const parsed = posCheckoutSchema.safeParse({
      warehouse_id: warehouseId,
      payment_method_id: paymentMethodId,
      coupon_code: couponCode,
      customer_name: customerName,
      customer_phone: customerPhone,
      amount_tendered: amountTendered,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Please check the sale details.");
      return;
    }

    posCheckout.mutate(
      {
        warehouse_id: parsed.data.warehouse_id,
        items: cart.map((line) => ({ product_id: line.product.id, quantity: line.quantity })),
        payment_method_id: parsed.data.payment_method_id,
        coupon_code: parsed.data.coupon_code || undefined,
        customer_name: parsed.data.customer_name || undefined,
        customer_phone: parsed.data.customer_phone || undefined,
        amount_tendered: parsed.data.amount_tendered || undefined,
      },
      {
        onSuccess: (result) => {
          setReceipt(result);
          resetForm();
        },
      }
    );
  }

  const productList = products?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Point of sale" description="Scan or search products to build a sale and check out." />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card className="border-primary/15 shadow-luxury-md">
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Step 1</p>
              <CardTitle className="text-display text-lg">Scan or find a product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <ScanBarcode className="text-primary pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2" />
                  <Input
                    autoFocus
                    className="h-12 pl-11 text-base"
                    placeholder="Scan barcode and press Enter…"
                    value={barcode}
                    onChange={(event) => setBarcode(event.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12"
                  disabled={barcodeLookup.isPending || !barcode.trim()}
                >
                  {barcodeLookup.isPending ? "Looking up…" : "Lookup"}
                </Button>
              </form>

              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" size="lg" className="w-full justify-between">
                    Search products manually…
                    <ChevronsUpDown className="size-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name or SKU…" />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup>
                        {productList.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={`${product.name} ${product.sku}`}
                            onSelect={() => {
                              addToCart(product);
                              setProductSearchOpen(false);
                            }}
                          >
                            <div className="flex flex-1 items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm">{product.name}</p>
                                <p className="text-muted-foreground text-xs">{product.sku}</p>
                              </div>
                              <Currency value={product.current_price} className="text-sm" />
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <p className="text-eyebrow text-muted-foreground">Step 2</p>
                <CardTitle className="text-display text-lg">Cart</CardTitle>
              </div>
              {cart.length > 0 && (
                <Badge variant="secondary" className="tabular-nums">
                  {cart.reduce((sum, line) => sum + line.quantity, 0)} item
                  {cart.reduce((sum, line) => sum + line.quantity, 0) === 1 ? "" : "s"}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <EmptyState title="Cart is empty" description="Scan a barcode or search for a product to add it." />
              ) : (
                <div className="stagger-children space-y-3">
                  {cart.map((line) => (
                    <div
                      key={line.product.id}
                      className="hover-lift-sm flex items-center justify-between gap-3 rounded-xl border p-3.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{line.product.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {line.product.sku} · <Currency value={line.product.current_price} /> each
                        </p>
                      </div>
                      <div className="bg-muted/50 flex items-center gap-1 rounded-lg p-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="size-8"
                          onClick={() => updateQuantity(line.product.id, -1)}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium tabular-nums">
                          {line.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="size-8"
                          onClick={() => updateQuantity(line.product.id, 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                      <Currency
                        value={Number(line.product.current_price) * line.quantity}
                        className="w-20 text-right text-sm font-semibold tabular-nums"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeLine(line.product.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <p className="text-eyebrow text-muted-foreground">Step 3</p>
              <CardTitle className="text-display text-lg">Sale details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label>Warehouse / outlet</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {(warehouses ?? []).map((warehouse) => (
                      <SelectItem key={warehouse.id} value={String(warehouse.id)}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {(paymentMethods ?? []).map((method) => (
                      <SelectItem key={method.id} value={String(method.id)}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Customer name</Label>
                  <Input
                    placeholder="Optional"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Customer phone</Label>
                  <Input
                    placeholder="Optional"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Coupon code</Label>
                <Input
                  placeholder="Optional"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Amount tendered (cash)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Optional"
                  value={amountTendered}
                  onChange={(event) => setAmountTendered(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/15 shadow-luxury-md">
            <CardContent className="space-y-4 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="tabular-nums font-medium">
                  {cart.reduce((sum, line) => sum + line.quantity, 0)}
                </span>
              </div>
              <Separator />
              <div className="flex items-end justify-between">
                <span className="text-muted-foreground text-sm font-medium">Subtotal</span>
                <Currency value={subtotal} className="text-display tabular-nums text-2xl" />
              </div>
              <p className="text-muted-foreground text-xs text-pretty">
                Tax, discounts, and coupon savings are applied by the server at checkout.
              </p>

              {formError && (
                <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
                  {formError}
                </p>
              )}

              <Button
                className="w-full"
                variant="gradient"
                size="xl"
                disabled={posCheckout.isPending}
                onClick={handleCheckout}
              >
                <Check className="size-4" />
                {posCheckout.isPending ? "Processing…" : "Complete sale"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!receipt} onOpenChange={(open) => !open && setReceipt(undefined)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center sm:items-center sm:text-center">
            <div className="bg-success/10 text-success ring-success/15 animate-in-scale mb-1 flex size-14 items-center justify-center rounded-2xl ring-1">
              <CheckCircle2 className="size-7" />
            </div>
            <DialogTitle className="text-display text-xl">Sale completed</DialogTitle>
            <DialogDescription>The sale has been recorded and stock updated.</DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="bg-muted/40 space-y-3 rounded-xl border p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order no.</span>
                <span className="font-medium">{receipt.data.order_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice no.</span>
                <span className="font-medium">{receipt.invoice?.invoice_no ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <Currency value={receipt.data.total_amount} className="font-semibold" />
              </div>
              <Separator />
              <div className={cn("flex items-center justify-between")}>
                <span className="font-semibold">Change due</span>
                <Currency value={receipt.change_due} className="text-display text-lg" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:flex-col">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => window.print()}
              disabled={!receipt}
            >
              <Printer className="size-4" />
              Print bill
            </Button>
            <Button className="w-full" variant="gradient" onClick={() => setReceipt(undefined)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {receipt && (
        <OrderReceipt order={receipt.data} invoice={receipt.invoice} changeDue={receipt.change_due} />
      )}
    </div>
  );
}