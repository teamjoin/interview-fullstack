import type { Express } from "express";
import { z } from "zod";
import { providerEventSchema, type ProviderEvent } from "./contracts";
import type { RenderLabClient } from "./client";

export function registerRenderLabRoutes(
  app: Express,
  {
    client,
    receive,
    resetStudio,
  }: {
    client: RenderLabClient;
    receive: (event: ProviderEvent) => void;
    resetStudio: () => void;
  }
) {
  app.post("/api/providers/renderlab/results", (req, res) => {
    receive(providerEventSchema.parse(req.body));
    res.json({ ok: true });
  });
  app.post("/api/simulator/reset", async (_req, res) => {
    await client.reset();
    resetStudio();
    res.json({ ok: true });
  });
  app.post("/api/simulator/fail-next", async (_req, res) => {
    await client.failNext();
    res.json({ ok: true });
  });
  app.post("/api/simulator/lose-next-ack", async (_req, res) => {
    await client.loseNextAck();
    res.json({ ok: true });
  });
  app.post("/api/simulator/replay", async (req, res) => {
    const { jobId } = z.object({ jobId: z.string() }).parse(req.body);
    await client.replay(jobId);
    res.json({ ok: true });
  });
}
