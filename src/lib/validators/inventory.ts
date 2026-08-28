import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(2, "Warehouse name is required."),
  code: z.string().min(2, "Warehouse code is required."),
  type: z.enum(["main", "branch", "outlet"]),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;

export const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name is required."),
  company_name: z.string().optional().or(z.literal("")),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;

const purchaseItemSchema = z.object({
  product_id: z.coerce.number().positive("Select a product."),
  product_variant_id: z.coerce.number().positive().optional().nullable(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  unit_cost: z.coerce.number().min(0, "Unit cost must be 0 or more."),
});

export const purchaseSchema = z.object({
  supplier_id: z.coerce.number({ error: "Supplier is required." }).positive(),
  warehouse_id: z.coerce.number({ error: "Warehouse is required." }).positive(),
  order_date: z.string().min(1, "Order date is required."),
  expected_date: z.string().optional().or(z.literal("")),
  tax_amount: z.coerce.number().min(0).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(purchaseItemSchema).min(1, "Add at least one item."),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

const transferItemSchema = z.object({
  product_id: z.coerce.number().positive("Select a product."),
  product_variant_id: z.coerce.number().positive().optional().nullable(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

export const stockTransferSchema = z
  .object({
    from_warehouse_id: z.coerce.number({ error: "Source warehouse is required." }).positive(),
    to_warehouse_id: z.coerce.number({ error: "Destination warehouse is required." }).positive(),
    transfer_date: z.string().min(1, "Transfer date is required."),
    notes: z.string().optional().or(z.literal("")),
    items: z.array(transferItemSchema).min(1, "Add at least one item."),
  })
  .refine((data) => data.from_warehouse_id !== data.to_warehouse_id, {
    message: "Source and destination warehouse must differ.",
    path: ["to_warehouse_id"],
  });

export type StockTransferFormValues = z.infer<typeof stockTransferSchema>;

const adjustmentItemSchema = z.object({
  product_id: z.coerce.number().positive("Select a product."),
  product_variant_id: z.coerce.number().positive().optional().nullable(),
  new_quantity: z.coerce.number().min(0, "Quantity cannot be negative."),
});

export const stockAdjustmentSchema = z.object({
  warehouse_id: z.coerce.number({ error: "Warehouse is required." }).positive(),
  reason: z.enum(["count", "expired", "other"]),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(adjustmentItemSchema).min(1, "Add at least one item."),
});

export type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;

const returnItemSchema = z.object({
  product_id: z.coerce.number().positive("Select a product."),
  product_variant_id: z.coerce.number().positive().optional().nullable(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  condition: z.enum(["good", "damaged"]),
});

export const stockReturnSchema = z.object({
  order_id: z.coerce.number().positive().optional().nullable(),
  warehouse_id: z.coerce.number({ error: "Warehouse is required." }).positive(),
  type: z.enum(["customer_return", "supplier_return"]),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(returnItemSchema).min(1, "Add at least one item."),
});

export type StockReturnFormValues = z.infer<typeof stockReturnSchema>;

const damageItemSchema = z.object({
  product_id: z.coerce.number().positive("Select a product."),
  product_variant_id: z.coerce.number().positive().optional().nullable(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  estimated_loss: z.coerce.number().min(0).optional(),
});

export const damageSchema = z.object({
  warehouse_id: z.coerce.number({ error: "Warehouse is required." }).positive(),
  reason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(damageItemSchema).min(1, "Add at least one item."),
});

export type DamageFormValues = z.infer<typeof damageSchema>;
