import { z } from "zod";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { generationSchema, eventSchema } from "../shared/contracts";

export function openStore(path: string) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY, product TEXT NOT NULL, color TEXT NOT NULL,
      status TEXT NOT NULL, currentJobId TEXT, error TEXT, updatedAt INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, generationId TEXT NOT NULL,
      jobId TEXT NOT NULL, type TEXT NOT NULL, detail TEXT NOT NULL, createdAt INTEGER NOT NULL
    );
  `);
  function getGeneration(id: string) {
    const row = db.prepare("SELECT * FROM generations WHERE id = ?").get(id);
    return row ? generationSchema.parse(row) : undefined;
  }
  function log(
    generationId: string,
    jobId: string,
    type: string,
    detail: string
  ) {
    db.prepare(
      "INSERT INTO events (generationId, jobId, type, detail, createdAt) VALUES (?, ?, ?, ?, ?)"
    ).run(generationId, jobId, type, detail, Date.now());
  }
  function snapshot() {
    return {
      generations: z
        .array(generationSchema)
        .parse(db.prepare("SELECT * FROM generations ORDER BY id").all()),
      events: z
        .array(eventSchema)
        .parse(
          db.prepare("SELECT * FROM events ORDER BY id DESC LIMIT 100").all()
        ),
    };
  }
  function reset() {
    db.exec("DELETE FROM events; DELETE FROM generations;");
    const seed = [
      {
        id: "gen-atelier",
        product: "Sac Atelier",
        color: "#dfc4a4",
        status: "failed",
        job: "initial-atelier",
        error: "Le fournisseur a interrompu la génération.",
      },
      {
        id: "gen-horizon",
        product: "Lampe Horizon",
        color: "#c3d6cf",
        status: "failed",
        job: "initial-horizon",
        error: "Le fournisseur a interrompu la génération.",
      },
      {
        id: "gen-orbite",
        product: "Casque Orbite",
        color: "#c9c4e3",
        status: "succeeded",
        job: "initial-orbite",
        error: null,
      },
    ];
    for (const item of seed) {
      db.prepare("INSERT INTO generations VALUES (?, ?, ?, ?, ?, ?, ?)").run(
        item.id,
        item.product,
        item.color,
        item.status,
        item.job,
        item.error,
        Date.now()
      );
    }
  }
  if (!getGeneration("gen-atelier")) reset();
  return { db, getGeneration, log, snapshot, reset };
}
export type Store = ReturnType<typeof openStore>;
