import { z } from "zod";
import { eventSchema, jobSchema } from "../../shared/contracts";

const acceptedSchema = z.object({ jobId: z.string() });
const providerSnapshotSchema = z.object({
  jobs: z.array(jobSchema),
  events: z.array(eventSchema),
});

export function createRenderLabClient(baseUrl: string) {
  async function request(path: string, body?: object) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`RenderLab HTTP ${response.status}`);
    }
    return response;
  }

  return {
    async submit(generationId: string, requestId?: string) {
      const response = await request("/v1/jobs", { generationId, requestId });
      return acceptedSchema.parse(await response.json()).jobId;
    },
    async snapshot() {
      const response = await request("/v1/debug/snapshot");
      return providerSnapshotSchema.parse(await response.json());
    },
    async reset() {
      await request("/v1/simulator/reset", {});
    },
    async failNext() {
      await request("/v1/simulator/fail-next", {});
    },
    async loseNextAck() {
      await request("/v1/simulator/lose-next-ack", {});
    },
    async replay(jobId: string) {
      await request("/v1/simulator/replay", { jobId });
    },
  };
}
export type RenderLabClient = ReturnType<typeof createRenderLabClient>;
