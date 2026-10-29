import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createApp } from "./app";
import { snapshotSchema } from "../shared/contracts";

test("the local API serves seeded generations and rejects invalid retries", async () => {
  const runtime = createApp(":memory:");
  const server = runtime.app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const response = await fetch(`${base}/api/studio`);
    const snapshot = snapshotSchema.parse(await response.json());
    assert.equal(snapshot.generations.length, 3);
    assert.equal(
      (await fetch(`${base}/api/generations/missing/retry`, { method: "POST" }))
        .status,
      404,
    );
    assert.equal(
      (
        await fetch(`${base}/api/generations/gen-orbite/retry`, {
          method: "POST",
        })
      ).status,
      409,
    );
  } finally {
    server.close();
    runtime.close();
  }
});
