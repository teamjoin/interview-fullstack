import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { snapshotSchema, type Snapshot } from "../shared/contracts";

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
      <aside>
        <a className="logo" href="/">
          JOIN<span>●</span>
        </a>
        <div className="workspace">
          ATELIER DEMO <span>⌄</span>
        </div>
        <nav>
          <span>Vue d’ensemble</span>
          <span>Stories</span>
          <span>Shopping Agent</span>
          <strong>✦ AI Video Creation</strong>
          <span>Médiathèque</span>
        </nav>
        <div className="aside-bottom">
          Espace de démonstration
          <br />
          <small>Données fictives · aucun coût réel</small>
        </div>
      </aside>
      <main>
        <header>
          <div>
            <span className="eyebrow">AI STUDIO / CRÉATION</span>
            <h1>Vos produits prennent vie.</h1>
            <p>
              Retrouvez vos générations et reprenez celles qui en ont besoin.
            </p>
          </div>
          <div className="avatar">AD</div>
        </header>
        <section className="summary">
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
            Collection d’automne <span>2026</span>
          </p>
        </section>
        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}
        <section>
          <div className="section-heading">
            <h2>Générations récentes</h2>
            <span>Actualisation automatique</span>
          </div>
          <div className="cards">
            {data.generations.map((g) => (
              <article className="card" key={g.id}>
                <div className="visual" style={{ background: g.color }}>
                  <span className="visual-word">{g.product.split(" ")[1]}</span>
                  <div className="sculpture">
                    {g.id === "gen-atelier"
                      ? "◒"
                      : g.id === "gen-horizon"
                        ? "◉"
                        : "◓"}
                  </div>
                  <span className="format">9:16 · 8 secondes</span>
                </div>
                <div className="card-body">
                  <div className="card-title">
                    <h3>{g.product}</h3>
                    <span className={`badge ${g.status}`}>
                      {labels[g.status]}
                    </span>
                  </div>
                  <p className="subline">Vidéo produit · Studio naturel</p>
                  <div className="status-text">
                    {g.status === "failed"
                      ? g.error
                      : g.status === "running"
                        ? "Votre vidéo est en préparation…"
                        : "Votre vidéo est prête à être utilisée."}
                  </div>
                  <button
                    disabled={g.status !== "failed"}
                    onClick={() =>
                      void act(() => post(`/api/generations/${g.id}/retry`))
                    }
                  >
                    {g.status === "failed"
                      ? "Relancer la génération"
                      : g.status === "running"
                        ? "Génération en cours…"
                        : "Génération terminée"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="tools">
          <button
            className="tools-toggle"
            onClick={() => setShowTools(!showTools)}
            aria-expanded={showTools}
          >
            Outils de développement {showTools ? "−" : "+"}
          </button>
          {showTools && (
            <div>
              <p>
                Le fournisseur est simulé. Les traitements acceptés sont
                visibles ci-dessous ; chaque acceptation représente un travail
                facturable.
              </p>
              <div className="toolbar">
                <button
                  onClick={() => void act(() => post("/api/simulator/reset"))}
                >
                  Réinitialiser la démo
                </button>
                <button
                  onClick={() =>
                    void act(() => post("/api/simulator/fail-next"))
                  }
                >
                  Faire échouer le prochain traitement
                </button>
                <button
                  onClick={() =>
                    void act(() => post("/api/simulator/lose-next-ack"))
                  }
                >
                  Perdre la prochaine confirmation
                </button>
              </div>
              <h3>Traitements fournisseur</h3>
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
                              (g) => g.id === j.generationId,
                            )?.product
                          }
                        </td>
                        <td>
                          <code>{j.id}</code>
                        </td>
                        <td>{labels[j.status]}</td>
                        <td>
                          <button
                            disabled={j.status === "running"}
                            onClick={() =>
                              void act(() =>
                                post("/api/simulator/replay", { jobId: j.id }),
                              )
                            }
                          >
                            Renvoyer le résultat
                          </button>
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
                      <code>{e.type}</code> · {e.detail}{" "}
                      <small>{e.jobId}</small>
                    </p>
                  ))}
                </div>
              </details>
            </div>
          )}
        </section>
        <footer>
          JOIN · AI Video Creation{" "}
          <span>Environnement d’entretien — fournisseur simulé</span>
        </footer>
      </main>
    </div>
  );
}
