import type { Generation } from "../../shared/contracts";
import { Badge, type BadgeTone } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { GenerationPreview } from "./GenerationPreview";

const presentation: Record<
  Generation["status"],
  { label: string; tone: BadgeTone }
> = {
  failed: { label: "Échec", tone: "danger" },
  running: { label: "En cours", tone: "warning" },
  succeeded: { label: "Prête", tone: "success" },
};

export function GenerationCard({
  generation,
  onRetry,
}: {
  generation: Generation;
  onRetry: () => void;
}) {
  const status = presentation[generation.status];
  return (
    <article className="generation-card" aria-label={generation.product}>
      <GenerationPreview generation={generation} />
      <div className="generation-card__body">
        <div className="generation-card__heading">
          <h3>{generation.product}</h3>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="generation-card__meta">
          Vidéo produit <span>·</span> Studio naturel
        </p>
        <p className="generation-card__status">
          {generation.status === "failed"
            ? generation.error
            : generation.status === "running"
            ? "Le traitement est en cours chez RenderLab."
            : "Votre vidéo est prête. Lancez la lecture ci-dessus."}
        </p>
        {generation.status === "succeeded" ? (
          <div className="generation-card__ready">
            <Icon name="check" />
            Clip de démonstration · 8 secondes
          </div>
        ) : (
          <Button
            className="generation-card__action"
            variant={generation.status === "failed" ? "primary" : "secondary"}
            disabled={generation.status !== "failed"}
            onClick={onRetry}
          >
            <Icon name={generation.status === "failed" ? "retry" : "clock"} />
            {generation.status === "failed"
              ? "Relancer la génération"
              : "Génération en cours…"}
          </Button>
        )}
      </div>
    </article>
  );
}
