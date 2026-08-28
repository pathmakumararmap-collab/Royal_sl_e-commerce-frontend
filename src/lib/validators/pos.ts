import { z } from "zod";

export const posCheckoutSchema = z.object({
  warehouse_id: z.coerce.number({ error: "Select an outlet." }).positive(),
  payment_method_id: z.coerce.number({ error: "Select a payment method." }).positive(),
  coupon_code: z.string().optional().or(z.literal("")),
  customer_name: z.string().optional().or(z.literal("")),
  customer_phone: z.string().optional().or(z.literal("")),
  amount_tendered: z.coerce.number().min(0).optional(),
});

export type PosCheckoutFormValues = z.infer<typeof posCheckoutSchema>;
