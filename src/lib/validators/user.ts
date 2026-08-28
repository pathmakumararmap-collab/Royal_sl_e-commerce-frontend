import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.email("Enter a valid email address."),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters."),
  status: z.enum(["active", "inactive", "banned"]).optional(),
  roles: z.array(z.string()).min(1, "Select at least one role."),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.email().optional(),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(8).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "banned"]).optional(),
  roles: z.array(z.string()).optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
