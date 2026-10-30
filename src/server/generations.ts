import type { ProviderEvent } from "./RenderLab/contracts";
import type { RenderLabClient } from "./RenderLab/client";
import type { Store } from "./store";

export class RequestError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export function createGenerationService(
  store: Store,
  provider: RenderLabClient
) {
  async function retry(id: string) {
    const generation = store.getGeneration(id);
    if (!generation) throw new RequestError(404, "Génération introuvable.");
    if (generation.status !== "failed")
      throw new RequestError(
        409,
        "Cette génération ne peut pas être relancée."
      );
    const jobId = await provider.submit(id);
    store.db
      .prepare(
        "UPDATE generations SET status = 'running', currentJobId = ?, error = NULL, updatedAt = ? WHERE id = ?"
      )
      .run(jobId, Date.now(), id);
    store.log(id, jobId, "generation.retry", "Relance demandée");
    return store.getGeneration(id);
  }
  function receive(event: ProviderEvent) {
    store.db
      .prepare(
        "UPDATE generations SET status = ?, error = ?, updatedAt = ? WHERE id = ?"
      )
      .run(
        event.status,
        event.status === "failed" ? event.error : null,
        Date.now(),
        event.generationId
      );
    store.log(
      event.generationId,
      event.jobId,
      "generation.updated",
      event.status
    );
  }
  return { retry, receive };
}
