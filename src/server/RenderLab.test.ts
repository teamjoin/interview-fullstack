import test from "node:test";
import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { createRenderLabClient } from "./RenderLab/client";

const provider = createRenderLabClient(
  process.env.RENDERLAB_URL ?? "http://renderlab:8080"
);

test("RenderLab HTTP deduplicates concurrent sends with the same request ID", async () => {
  await provider.reset();
  try {
    const ids = await Promise.all([
      provider.submit("gen-atelier", "request-contract"),
      provider.submit("gen-atelier", "request-contract"),
    ]);
    assert.deepEqual(ids, ["request-contract", "request-contract"]);
    assert.equal(
      (await provider.snapshot()).jobs.filter(
        (job) => job.id === "request-contract"
      ).length,
      1
    );
    await assert.rejects(provider.submit("gen-horizon", "request-contract"));
  } finally {
    await provider.reset();
  }
});

test("RenderLab closes the HTTP connection after acceptance without duplicating a resend", async () => {
  await provider.reset();
  try {
    await provider.loseNextAck();
    await assert.rejects(provider.submit("gen-atelier", "request-lost"));
    assert.equal(
      await provider.submit("gen-atelier", "request-lost"),
      "request-lost"
    );
    for (let i = 0; i < 70; i++) {
      const jobs = (await provider.snapshot()).jobs.filter(
        (job) => job.id === "request-lost"
      );
      assert.equal(jobs.length, 1);
      if (jobs[0]?.status === "succeeded") return;
      await delay(100);
    }
    assert.fail("The accepted work never completed");
  } finally {
    await provider.reset();
  }
});
