import { z } from 'zod';

export const statusSchema = z.enum(['failed', 'running', 'succeeded']);
export const generationSchema = z.object({
  id: z.string(), product: z.string(), color: z.string(),
  status: statusSchema, currentJobId: z.string().nullable(),
  error: z.string().nullable(), updatedAt: z.number(),
});
export const jobSchema = z.object({
  id: z.string(), generationId: z.string(), status: statusSchema,
  createdAt: z.number(), error: z.string().nullable(),
});
export const eventSchema = z.object({
  id: z.number(), generationId: z.string(), jobId: z.string(),
  type: z.string(), detail: z.string(), createdAt: z.number(),
});
export const snapshotSchema = z.object({
  generations: z.array(generationSchema), jobs: z.array(jobSchema), events: z.array(eventSchema),
});
export const providerEventSchema = z.discriminatedUnion('status', [
  z.object({ generationId: z.string(), jobId: z.string(), status: z.literal('succeeded') }),
  z.object({ generationId: z.string(), jobId: z.string(), status: z.literal('failed'), error: z.string() }),
]);
export type Generation = z.infer<typeof generationSchema>;
export type ProviderEvent = z.infer<typeof providerEventSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
