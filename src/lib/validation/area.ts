import { z } from "zod";

export const areaSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  weight: z
    .number()
    .min(1, "Weight must be at least 1")
    .max(10, "Weight must be at most 10"),
});

export type AreaFormData = z.infer<typeof areaSchema>;
