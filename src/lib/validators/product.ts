import { z } from "zod";

export const productSchema = z.object({
  category_id: z.coerce.number({ error: "Category is required." }).positive(),
  brand_id: z.coerce.number().positive().optional().nullable(),
  supplier_id: z.coerce.number().positive().optional().nullable(),
  name: z.string().min(2, "Product name is required."),
  sku: z.string().min(1, "SKU is required."),
  barcode: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  short_description: z.string().max(500).optional().or(z.literal("")),
  cost_price: z.coerce.number({ error: "Cost price is required." }).min(0),
  selling_price: z.coerce.number({ error: "Selling price is required." }).min(0),
  discount_price: z.coerce.number().min(0).optional().nullable(),
  tax_rate: z.coerce.number().min(0).max(100).optional(),
  unit: z.string().optional().or(z.literal("")),
  has_variants: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  low_stock_threshold: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional().nullable(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  parent_id: z.coerce.number().positive().optional().nullable(),
  name: z.string().min(2, "Category name is required."),
  slug: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
  sort_order: z.coerce.number().min(0).optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().min(2, "Brand name is required."),
  slug: z.string().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export type BrandFormValues = z.infer<typeof brandSchema>;
