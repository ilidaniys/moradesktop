import { z } from "zod";

export const intentionFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  status: z.enum(["active", "paused", "done"]).default("active"),
});

export type IntentionFormData = z.infer<typeof intentionFormSchema>;
