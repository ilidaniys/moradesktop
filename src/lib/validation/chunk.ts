import { z } from "zod";

export const chunkFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  dod: z
    .string()
    .min(5, "Definition of Done is required (at least 5 characters)")
    .max(500, "Definition of Done must be less than 500 characters"),
  durationMin: z
    .number()
    .min(30, "Duration must be at least 30 minutes")
    .max(120, "Duration must be at most 120 minutes"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["backlog", "ready"]).default("backlog"),
});

export type ChunkFormData = z.infer<typeof chunkFormSchema>;
