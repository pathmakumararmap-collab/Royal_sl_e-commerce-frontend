import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().optional().or(z.literal("")),
  recipient_name: z.string().min(2, "Recipient name is required."),
  phone: z.string().min(7, "Enter a valid phone number."),
  address_line1: z.string().min(3, "Address line 1 is required."),
  address_line2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required."),
  state: z.string().optional().or(z.literal("")),
  postal_code: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  type: z.enum(["shipping", "billing"]),
  is_default: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.email("Enter a valid email address."),
  phone: z.string().optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
