import express from "express";
import { z } from "zod";
import { openStore } from "./store";
import { createRenderLabClient } from "./RenderLab/client";
import { registerRenderLabRoutes } from "./RenderLab/routes";
import { createGenerationService, RequestError } from "./generations";
import { batchRetrySchema, createBatchService } from "./batches";

export function createApp(
  databasePath: string,
  renderLabUrl = process.env.RENDERLAB_URL ?? "http://renderlab:8080"
) {
  const store = openStore(databasePath);
  const provider = createRenderLabClient(renderLabUrl);
  const service = createGenerationService(store, provider);
  const batches = createBatchService(service);
  const app = express();
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/api/studio", async (_req, res) => {
    const local = store.snapshot();
    const remote = await provider.snapshot();
    res.json({
      generations: local.generations,
      jobs: remote.jobs,
      events: [...local.events, ...remote.events]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 100),
    });
  });
  app.post("/api/generations/:id/retry", async (req, res) => {
    const id = z.string().parse(req.params.id);
    res.status(202).json(await service.retry(id));
  });
  app.post("/api/generation-batches/retry", async (req, res) => {
    const input = batchRetrySchema.parse(req.body);
    res.status(202).json(await batches.retry(input));
  });
  registerRenderLabRoutes(app, {
    client: provider,
    receive: service.receive,
    resetStudio: store.reset,
  });
  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (error instanceof RequestError) {
        res.status(error.status).json({ message: error.message });
        return;
      }
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Requête invalide." });
        return;
      }
      process.stderr.write(`${String(error)}\n`);
      res.status(500).json({ message: "Une erreur est survenue." });
    }
  );
  return {
    app,
    store,
    close() {
      store.db.close();
    },
  };
}
