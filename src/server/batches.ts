import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { createGenerationService } from "./generations";

export const batchRetrySchema = z.object({
  generationIds: z.array(z.string().min(1)).min(1).max(500)
    .refine((ids) => new Set(ids).size === ids.length),
});

export function createBatchService(
  generations: ReturnType<typeof createGenerationService>
) {
  async function retry({ generationIds }: z.infer<typeof batchRetrySchema>) {
    const batchId = randomUUID();
    const items = await Promise.all(
      generationIds.map(async (generationId) => {
        const generation = await generations.retry(generationId);
        return { generationId, jobId: generation?.currentJobId };
      })
    );
    return { batchId, accepted: items.length, items };
  }
  return { retry };
}
