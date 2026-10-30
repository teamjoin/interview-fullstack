import { z } from "zod";

export const providerEventSchema = z.discriminatedUnion("status", [
  z.object({
    generationId: z.string(),
    jobId: z.string(),
    status: z.literal("succeeded"),
  }),
  z.object({
    generationId: z.string(),
    jobId: z.string(),
    status: z.literal("failed"),
    error: z.string(),
  }),
]);
export type ProviderEvent = z.infer<typeof providerEventSchema>;
