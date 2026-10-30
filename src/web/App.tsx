import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { snapshotSchema, type Snapshot } from "../shared/contracts";

import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Notice } from "./ui/Notice";
import { Icon } from "./ui/Icon";
import { GenerationCard } from "./components/GenerationCard";

const labels = { failed: "Échec", running: "En cours", succeeded: "Prête" };
export function App() {
  const [data, setData] = useState<Snapshot>({
    generations: [],
    jobs: [],
    events: [],
  });
  const [error, setError] = useState("");
  const [showDiscussion, setShowDiscussion] = useState(false);
  const refresh = useCallback(async () => {
    const response = await fetch("/api/studio");
    if (!response.ok) throw new Error("Impossible de charger le studio.");
    setData(snapshotSchema.parse(await response.json()));
  }, []);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        if (active) await refresh();
      } catch {
        if (active) setError("Connexion au studio interrompue.");
      }
      if (active) timer = setTimeout(poll, 800);
    }
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [refresh]);
  async function post(path: string, body?: object) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    if (!response.ok) {
      const result = z
        .object({ message: z.string() })
        .parse(await response.json());
      throw new Error(result.message);
    }
  }
  async function act(action: () => Promise<void>) {
    setError("");
    try {
      await action();
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action impossible.");
    }
  }
  return (
    <main className="studio-main">
      <header className="studio-header">
        <div>
          <span className="eyebrow">JOIN · AI VIDEO CREATION</span>
          <h1>Générations vidéo</h1>
          <p>RenderLab accepte les demandes, puis envoie leur résultat.</p>
        </div>
        <span className="simulation-label">
          Simulation locale · échecs initiaux volontaires
        </span>
      </header>
      {error && (
        <Notice tone="danger" announce>
          {error}
        </Notice>
      )}
      <section aria-labelledby="generations-title">
        <div className="section-heading">
          <h2 id="generations-title">Vidéos</h2>
          <span>
            <span className="live-dot" />
            Actualisation automatique
          </span>
        </div>
        <div className="cards">
          {data.generations.map((g) => (
            <GenerationCard
              key={g.id}
              generation={g}
              onRetry={() =>
                void act(() => post(`/api/generations/${g.id}/retry`))
              }
            />
          ))}
        </div>
      </section>
      <section className="tools" aria-labelledby="tools-title">
        <div className="section-heading">
          <h2 id="tools-title">Scénarios</h2>
          <span role="status">
            {showDiscussion
              ? "Étape 2 · Confirmation perdue"
              : "Étape 1 · Corriger les relances"}
          </span>
        </div>
        <div className="toolbar">
          <Button
            size="sm"
            onClick={() =>
              void act(async () => {
                await post("/api/simulator/reset");
                setShowDiscussion(false);
              })
            }
          >
            <Icon name="retry" />
            Réinitialiser la démo
          </Button>
          <Button
            size="sm"
            onClick={() => void act(() => post("/api/simulator/fail-next"))}
          >
            Faire échouer le prochain traitement
          </Button>
          {showDiscussion ? (
            <Button
              size="sm"
              onClick={() =>
                void act(() => post("/api/simulator/lose-next-ack"))
              }
            >
              Perdre la prochaine confirmation
            </Button>
          ) : (
            <Button size="sm" onClick={() => setShowDiscussion(true)}>
              Suivant : confirmation perdue
              <Icon name="arrow" />
            </Button>
          )}
        </div>
        <p className="hint">
          {showDiscussion
            ? "Activez le scénario avec l’interviewer. Passer à cette étape ne déclenche aucune panne."
            : "La confirmation perdue sera abordée avec l’interviewer après la pratique."}
        </p>
      </section>
      <section className="history" aria-labelledby="history-title">
        <div className="section-heading">
          <h2 id="history-title">
            Traitements RenderLab{" "}
            <span className="job-count">{data.jobs.length}</span>
          </h2>
          <span>Chaque traitement accepté représente un coût fictif.</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Traitement</th>
                <th>Résultat</th>
                <th>Notification</th>
              </tr>
            </thead>
            <tbody>
              {data.jobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    {
                      data.generations.find((g) => g.id === j.generationId)
                        ?.product
                    }
                  </td>
                  <td>
                    <code>{j.id}</code>
                  </td>
                  <td>
                    <Badge
                      tone={
                        j.status === "failed"
                          ? "danger"
                          : j.status === "running"
                          ? "warning"
                          : "success"
                      }
                    >
                      {labels[j.status]}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      disabled={j.status === "running"}
                      onClick={() =>
                        void act(() =>
                          post("/api/simulator/replay", { jobId: j.id })
                        )
                      }
                    >
                      Renvoyer le résultat
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details open>
          <summary>Journal des événements</summary>
          <div className="events">
            {data.events.map((e) => (
              <p key={e.id}>
                <time>{new Date(e.createdAt).toLocaleTimeString("fr-FR")}</time>{" "}
                <code>{e.type}</code> · {e.detail}
                <small>{e.jobId}</small>
              </p>
            ))}
          </div>
        </details>
      </section>
      <footer className="studio-footer">
        <span>Données et clips de démonstration · aucun coût réel.</span>
        <a href="/design-system">Design system</a>
      </footer>
    </main>
  );
}
