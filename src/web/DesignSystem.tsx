import { useState } from "react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Icon } from "./ui/Icon";
import { Notice } from "./ui/Notice";
import { GenerationCard } from "./components/GenerationCard";
import type { Generation } from "../shared/contracts";

const swatches = [
  { label: "Action", variable: "--color-accent", hex: "#6650D8" },
  { label: "Texte", variable: "--color-ink", hex: "#252333" },
  { label: "Fond", variable: "--color-canvas", hex: "#F7F7FA" },
  { label: "Succès", variable: "--color-success", hex: "#267351" },
  { label: "Attente", variable: "--color-warning", hex: "#73521E" },
  { label: "Erreur", variable: "--color-danger", hex: "#AE473D" },
];
const cardSamples: Generation[] = [
  {
    id: "gen-atelier",
    product: "Sac Atelier",
    color: "#dfc4a4",
    status: "failed",
    currentJobId: null,
    error: "Le fournisseur a interrompu la génération.",
    updatedAt: 0,
  },
  {
    id: "gen-horizon",
    product: "Lampe Horizon",
    color: "#c3d6cf",
    status: "running",
    currentJobId: "preview-running",
    error: null,
    updatedAt: 0,
  },
  {
    id: "gen-orbite",
    product: "Casque Orbite",
    color: "#c9c4e3",
    status: "succeeded",
    currentJobId: "preview-ready",
    error: null,
    updatedAt: 0,
  },
];

export function DesignSystem() {
  const [interaction, setInteraction] = useState("");
  return (
    <main className="ds-page">
      <a href="/" className="ui-button ui-button--secondary ui-button--sm">
        ← Retour au Studio
      </a>
      <header>
        <span className="eyebrow">
          <Icon name="grid" />
          JOIN · DESIGN SYSTEM
        </span>
        <h1>Une base simple. Des états clairs.</h1>
        <p>
          Les composants utilisés dans le Studio, avec les mêmes styles et
          comportements. Cette page est une référence visuelle ; ses exemples
          n’agissent pas sur les générations de l’exercice.
        </p>
      </header>
      <section className="ui-panel ds-section">
        <h2>01 · Couleurs sémantiques</h2>
        <div className="ds-swatches">
          {swatches.map((s) => (
            <div className="ds-swatch" key={s.variable}>
              <div style={{ background: `var(${s.variable})` }} />
              <strong>{s.label}</strong>
              <br />
              {s.hex}
            </div>
          ))}
        </div>
        <p>
          Le violet guide l’action. Les couleurs de statut sont toujours
          accompagnées d’un texte.
        </p>
      </section>
      <section className="ui-panel ds-section">
        <h2>02 · Typographie & rythme</h2>
        <p className="eyebrow">UN REPÈRE DISCRET</p>
        <h1>Vos produits prennent vie.</h1>
        <p>
          Une police système pour l’interface, une touche éditoriale dans les
          aperçus. Espacements sur une base de 4 pixels.
        </p>
        <div className="ds-spacing">
          {[4, 8, 12, 16, 20, 24, 32, 40, 48].map((n) => (
            <div key={n}>
              <span style={{ height: n }} />
              {n}
            </div>
          ))}
        </div>
      </section>
      <section className="ui-panel ds-section">
        <h2>03 · Actions</h2>
        <div className="ds-row">
          <Button
            variant="primary"
            onClick={() => setInteraction("Action principale activée.")}
          >
            <Icon name="retry" />
            Action principale
          </Button>
          <Button onClick={() => setInteraction("Action secondaire activée.")}>
            Secondaire
          </Button>
          <Button
            variant="ghost"
            onClick={() => setInteraction("Action discrète activée.")}
          >
            Discrète
            <Icon name="arrow" />
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              setInteraction(
                "Action destructive simulée, aucune donnée modifiée."
              )
            }
          >
            Destructive
          </Button>
          <Button disabled>Indisponible</Button>
        </div>
        <div className="ds-row">
          <Button
            size="sm"
            onClick={() => setInteraction("Petit bouton activé.")}
          >
            Petit bouton
          </Button>
          <Button variant="primary" disabled>
            <Icon name="clock" />
            En cours…
          </Button>
        </div>
        <p role="status">
          {interaction ||
            "Essayez les boutons ou naviguez au clavier avec Tab."}
        </p>
      </section>
      <section className="ui-panel ds-section">
        <h2>04 · Statuts & messages</h2>
        <div className="ds-row">
          <Badge>Neutre</Badge>
          <Badge tone="success">Prête</Badge>
          <Badge tone="warning">En cours</Badge>
          <Badge tone="danger">Échec</Badge>
        </div>
        <div className="ds-row">
          <Notice>Un contexte utile, au bon endroit.</Notice>
          <Notice tone="danger">
            Le traitement a échoué. Vous pouvez réessayer.
          </Notice>
        </div>
      </section>
      <section className="ds-section">
        <h2>05 · Une carte, trois états</h2>
        <p>
          Échec illustré, traitement en cours sans pourcentage inventé et vidéo
          prête avec lecture à la demande. Ces cartes réutilisent le composant
          du Studio.
        </p>
        <div className="cards">
          {cardSamples.map((g) => (
            <GenerationCard
              key={g.id}
              generation={g}
              onRetry={() =>
                setInteraction(
                  "Relance simulée dans la galerie. Aucune requête envoyée au fournisseur."
                )
              }
            />
          ))}
        </div>
        <p role="status">
          {interaction.startsWith("Relance") ? interaction : ""}
        </p>
      </section>
      <section className="ui-panel ds-section">
        <h2>06 · Règles d’usage</h2>
        <p>
          Une action principale par carte. Des libellés explicites, un focus
          visible et des boutons désactivés reconnaissables. Pas de lecture
          automatique ni de son. Les animations respectent la préférence de
          mouvement réduit.
        </p>
        <p>
          Les couleurs, espaces, rayons et tailles sont définis dans{" "}
          <code>src/web/ui/tokens.css</code>. Les composants sont dans{" "}
          <code>src/web/ui/</code>. La présentation métier reste dans{" "}
          <code>src/web/components/</code>.
        </p>
      </section>
    </main>
  );
}
