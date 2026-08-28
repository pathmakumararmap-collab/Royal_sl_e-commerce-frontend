import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters.").toUpperCase(),
  type: z.enum(["fixed", "percentage"]),
  value: z.coerce.number({ error: "Value is required." }).min(0),
  min_order_amount: z.coerce.number().min(0).optional(),
  max_discount_amount: z.coerce.number().min(0).optional().nullable(),
  usage_limit: z.coerce.number().min(1).optional().nullable(),
  usage_limit_per_user: z.coerce.number().min(1).optional().nullable(),
  starts_at: z.string().optional().or(z.literal("")),
  expires_at: z.string().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
  applicable_to: z.enum(["all", "category", "product"]),
  product_ids: z.array(z.number()).optional(),
  category_ids: z.array(z.number()).optional(),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
