import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import type { ProviderEvent } from "../shared/contracts";
import type { Store } from "./store";

export function createProvider(store: Store) {
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let epoch = 0;
  let failNext = false;
  let callback: (event: ProviderEvent) => void = () => {};
  function schedule(event: ProviderEvent, ms: number) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (event.status === "succeeded") {
        store.db
          .prepare(
            "UPDATE jobs SET status = 'succeeded', error = NULL WHERE id = ?",
          )
          .run(event.jobId);
      } else {
        store.db
          .prepare("UPDATE jobs SET status = 'failed', error = ? WHERE id = ?")
          .run(event.error, event.jobId);
      }
      store.log(
        event.generationId,
        event.jobId,
        "provider.result",
        event.status,
      );
      callback(event);
    }, ms);
    timers.add(timer);
  }
  async function submit(generationId: string) {
    const requestEpoch = epoch;
    const shouldFail = failNext;
    failNext = false;
    await delay(600);
    if (requestEpoch !== epoch) throw new Error("Simulation reset");
    const id = randomUUID();
    store.db
      .prepare("INSERT INTO jobs VALUES (?, ?, ?, ?, ?)")
      .run(id, generationId, "running", Date.now(), null);
    store.log(generationId, id, "provider.accepted", "Traitement accepté");
    schedule(
      shouldFail
        ? {
            generationId,
            jobId: id,
            status: "failed",
            error: "Service de génération temporairement indisponible.",
          }
        : { generationId, jobId: id, status: "succeeded" },
      2500,
    );
    return id;
  }
  function reset() {
    epoch++;
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    failNext = false;
  }
  function replay(jobId: string) {
    const job = store.snapshot().jobs.find((item) => item.id === jobId);
    if (!job || job.status === "running") return false;
    schedule(
      job.status === "succeeded"
        ? { generationId: job.generationId, jobId, status: "succeeded" }
        : {
            generationId: job.generationId,
            jobId,
            status: "failed",
            error: job.error ?? "Échec fournisseur.",
          },
      0,
    );
    return true;
  }
  return {
    submit,
    reset,
    replay,
    onResult(listener: (event: ProviderEvent) => void) {
      callback = listener;
    },
    failNext() {
      failNext = true;
    },
  };
}
export type Provider = ReturnType<typeof createProvider>;
