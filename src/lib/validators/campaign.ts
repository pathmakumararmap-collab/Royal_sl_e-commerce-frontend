import { z } from "zod";

/**
 * Campaigns are a client-only feature (no backend concept exists) — this
 * schema is not backend-facing, but lives here alongside the other
 * validators for consistency.
 */
export const campaignSchema = z
  .object({
    name: z.string().min(2, "Campaign name is required."),
    channel: z.enum(["email", "sms", "social", "push", "other"]),
    start_date: z.string().min(1, "Start date is required."),
    end_date: z.string().min(1, "End date is required."),
    status: z.enum(["planned", "active", "completed"]),
    notes: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "End date must be on or after the start date.",
    path: ["end_date"],
  });

export type CampaignFormValues = z.infer<typeof campaignSchema>;
