import test from "node:test";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { createProvider } from "./provider";
import { openStore } from "./store";
import type { ProviderEvent } from "../shared/contracts";

test("provider deduplicates concurrent sends with the same request ID", async () => {
  const store = openStore(":memory:");
  const provider = createProvider(store);
  try {
    const ids = await Promise.all([
      provider.submit("gen-atelier", "request-contract"),
      provider.submit("gen-atelier", "request-contract"),
    ]);
    assert.deepEqual(ids, ["request-contract", "request-contract"]);
    assert.equal(
      store.snapshot().jobs.filter((job) => job.id === "request-contract")
        .length,
      1
    );
    await assert.rejects(provider.submit("gen-horizon", "request-contract"));
  } finally {
    provider.reset();
    store.db.close();
  }
});

test("lost acknowledgement still produces a result and resending does not duplicate work", async () => {
  const store = openStore(":memory:");
  const provider = createProvider(store);
  const events: ProviderEvent[] = [];
  provider.onResult((event) => events.push(event));
  try {
    provider.loseNextAck();
    await assert.rejects(provider.submit("gen-atelier", "request-lost"));
    assert.equal(
      await provider.submit("gen-atelier", "request-lost"),
      "request-lost"
    );
    for (let i = 0; i < 50 && events.length === 0; i++) await delay(100);
    assert.deepEqual(events, [
      {
        generationId: "gen-atelier",
        jobId: "request-lost",
        status: "succeeded",
      },
    ]);
    assert.equal(
      store.snapshot().jobs.filter((job) => job.id === "request-lost").length,
      1
    );
  } finally {
    provider.reset();
    store.db.close();
  }
});
