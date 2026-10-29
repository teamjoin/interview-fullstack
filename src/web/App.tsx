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
  const [showTools, setShowTools] = useState(false);
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
    <div className="shell">
      <aside className="sidebar">
        <a className="logo" href="/" aria-label="JOIN Studio">
          JOIN<span>●</span>
        </a>
        <div className="workspace">
          <span className="workspace-mark">a.</span>Atelier Demo
          <Icon name="chevron" />
        </div>
        <p className="nav-label">VOTRE ESPACE</p>
        <nav aria-label="Produits JOIN">
          <span>
            <Icon name="grid" />
            Vue d’ensemble
          </span>
          <span>
            <Icon name="layers" />
            Stories
          </span>
          <span>
            <Icon name="bag" />
            Shopping Agent
          </span>
          <strong aria-current="page">
            <Icon name="sparkles" />
            AI Video Creation
          </strong>
          <span>
            <Icon name="film" />
            Médiathèque
          </span>
        </nav>
        <div className="aside-bottom">
          <a href="/design-system">
            <Icon name="grid" />
            Design system
            <Icon name="arrow" />
          </a>
          <div className="demo-note">
            <strong>Un espace pour expérimenter.</strong>Données fictives, aucun
            coût réel.
          </div>
        </div>
      </aside>
      <main className="studio-main">
        <header className="studio-header">
          <div>
            <span className="eyebrow">
              <Icon name="sparkles" />
              AI VIDEO CREATION
            </span>
            <h1>Vos produits prennent vie.</h1>
            <p>
              Du produit à l’histoire. Retrouvez vos créations vidéo et donnez
              une nouvelle chance à celles qui en ont besoin.
            </p>
          </div>
          <div className="avatar" aria-label="Atelier Demo">
            AD
          </div>
        </header>
        <section className="summary" aria-label="Résumé des générations">
          <div>
            <b>{data.generations.length}</b>
            <span>produits</span>
          </div>
          <div>
            <b>
              {data.generations.filter((g) => g.status === "succeeded").length}
            </b>
            <span>vidéos prêtes</span>
          </div>
          <div>
            <b>
              {data.generations.filter((g) => g.status === "failed").length}
            </b>
            <span>à reprendre</span>
          </div>
          <p>
            <Icon name="sparkles" />
            Collection d’automne · 2026
          </p>
        </section>
        {error && (
          <Notice tone="danger" announce>
            {error}
          </Notice>
        )}
        <section aria-labelledby="generations-title">
          <div className="section-heading">
            <h2 id="generations-title">Générations récentes</h2>
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
        <section className="tools">
          <Button
            variant="ghost"
            className="tools-toggle"
            onClick={() => setShowTools(!showTools)}
            aria-expanded={showTools}
            aria-controls="simulation-tools"
          >
            <span>
              <Icon name="code" />
              Outils de développement
            </span>
            <span aria-hidden="true">{showTools ? "−" : "+"}</span>
          </Button>
          {showTools && (
            <div className="tools-content" id="simulation-tools">
              <p>
                <strong>RenderLab, fournisseur fictif.</strong> Il accepte les
                demandes, effectue le traitement puis notifie leur résultat.
                Chaque nouveau traitement accepté représente un coût fictif,
                même s’il échoue. Les clips de démonstration sont déjà inclus
                dans l’application ; aucun service externe ni paiement réel.
              </p>
              <div className="toolbar">
                <Button
                  size="sm"
                  onClick={() => void act(() => post("/api/simulator/reset"))}
                >
                  <Icon name="retry" />
                  Réinitialiser la démo
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    void act(() => post("/api/simulator/fail-next"))
                  }
                >
                  Faire échouer le prochain traitement
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    void act(() => post("/api/simulator/lose-next-ack"))
                  }
                >
                  Perdre la prochaine confirmation
                </Button>
              </div>
              <h3>Traitements RenderLab</h3>
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
                            data.generations.find(
                              (g) => g.id === j.generationId
                            )?.product
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
              <details>
                <summary>Journal des événements</summary>
                <div className="events">
                  {data.events.map((e) => (
                    <p key={e.id}>
                      <time>
                        {new Date(e.createdAt).toLocaleTimeString("fr-FR")}
                      </time>{" "}
                      <code>{e.type}</code> · {e.detail}
                      <small>{e.jobId}</small>
                    </p>
                  ))}
                </div>
              </details>
            </div>
          )}
        </section>
        <footer className="studio-footer">
          <span>JOIN · Créations par RenderLab, fournisseur fictif.</span>
          <span>
            Clips de démonstration · <a href="/design-system">Design system</a>
          </span>
        </footer>
      </main>
    </div>
  );
}
