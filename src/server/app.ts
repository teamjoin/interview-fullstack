import express from "express";
import { z } from "zod";
import { openStore } from "./store";
import { createProvider } from "./provider";
import { createGenerationService, RequestError } from "./generations";

export function createApp(databasePath: string) {
  const store = openStore(databasePath);
  const provider = createProvider(store);
  const service = createGenerationService(store, provider);
  const app = express();
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/api/studio", (_req, res) => {
    res.json(store.snapshot());
  });
  app.post("/api/generations/:id/retry", async (req, res) => {
    const id = z.string().parse(req.params.id);
    res.status(202).json(await service.retry(id));
  });
  app.post("/api/simulator/reset", (_req, res) => {
    provider.reset();
    store.reset();
    res.json(store.snapshot());
  });
  app.post("/api/simulator/fail-next", (_req, res) => {
    provider.failNext();
    res.json({ ok: true });
  });
  app.post("/api/simulator/replay", (req, res) => {
    const { jobId } = z.object({ jobId: z.string() }).parse(req.body);
    if (!provider.replay(jobId))
      throw new RequestError(404, "Résultat fournisseur introuvable.");
    res.json({ ok: true });
  });
  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
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
    },
  );
  return {
    app,
    store,
    close() {
      provider.reset();
      store.db.close();
    },
  };
}
