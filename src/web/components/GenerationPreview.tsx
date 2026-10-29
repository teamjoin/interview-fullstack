import { useRef, useState } from "react";
import type { Generation } from "../../shared/contracts";
import { Icon } from "../ui/Icon";
import { demoMedia, type DemoMedia } from "./demo-media";

function VideoPreview({
  media,
  product,
}: {
  media: DemoMedia;
  product: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  async function play() {
    setPlaybackError("");
    try {
      await video.current?.play();
    } catch {
      setPlaybackError(
        "Lecture impossible. Réessayez avec les commandes du lecteur."
      );
      setStarted(true);
    }
  }
  return (
    <>
      <video
        ref={video}
        className="generation-video"
        src={media.video}
        poster={media.poster}
        controls={started}
        playsInline
        preload="none"
        aria-label={`Vidéo de démonstration : ${product}`}
        onPlay={() => setStarted(true)}
        onError={() =>
          setPlaybackError("Le clip de démonstration est indisponible.")
        }
      />
      {!started && !playbackError && (
        <button
          className="video-play"
          onClick={() => void play()}
          aria-label={`Lire la vidéo de ${product}`}
        >
          <span className="video-play__circle">
            <Icon name="play" />
          </span>
          <span>Lire la vidéo</span>
        </button>
      )}
      {playbackError && (
        <div className="media-playback-error" role="alert">
          {playbackError}
        </div>
      )}
    </>
  );
}

export function GenerationPreview({ generation }: { generation: Generation }) {
  const media = demoMedia[generation.id];
  return (
    <div
      className={`generation-preview generation-preview--${generation.status}`}
    >
      {generation.status === "succeeded" && media ? (
        <VideoPreview
          key={generation.currentJobId}
          media={media}
          product={generation.product}
        />
      ) : (
        <>
          {media && (
            <img className="generation-poster" src={media.poster} alt="" />
          )}
          <div
            className="media-state"
            role="img"
            aria-label={
              generation.status === "failed"
                ? `Échec de génération : ${generation.product}`
                : generation.status === "running"
                ? `Génération en cours : ${generation.product}`
                : `Vidéo indisponible : ${generation.product}`
            }
          >
            <div className="media-state__icon">
              <Icon
                name={generation.status === "failed" ? "film" : "sparkles"}
              />
              {generation.status === "failed" && (
                <span className="media-state__cross">×</span>
              )}
            </div>
            <strong>
              {generation.status === "failed"
                ? "La création s’est interrompue"
                : generation.status === "running"
                ? "Votre vidéo prend forme"
                : "Aperçu indisponible"}
            </strong>
            <span>
              {generation.status === "failed"
                ? "Votre produit attend une nouvelle prise."
                : generation.status === "running"
                ? "RenderLab prépare votre création…"
                : "Aucun clip associé à ce produit."}
            </span>
            {generation.status === "running" && (
              <span className="media-progress" aria-hidden="true">
                <span />
              </span>
            )}
          </div>
        </>
      )}
      <div className="media-topline" aria-hidden="true">
        <span>
          {media?.collection ?? generation.product}
          <i>.</i>
        </span>
        <span className="media-format">9:16 · 8 s</span>
      </div>
      {generation.status !== "succeeded" && (
        <span className="media-footnote">
          {generation.status === "failed"
            ? "GÉNÉRATION NON ABOUTIE"
            : "CRÉATION EN COURS"}
        </span>
      )}
    </div>
  );
}
