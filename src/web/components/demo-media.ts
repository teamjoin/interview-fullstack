export type DemoMedia = { poster: string; video: string; collection: string };

export const demoMedia: Record<string, DemoMedia> = {
  "gen-atelier": {
    poster: "/media/atelier.jpg",
    video: "/media/atelier.mp4",
    collection: "Atelier",
  },
  "gen-horizon": {
    poster: "/media/horizon.jpg",
    video: "/media/horizon.mp4",
    collection: "Horizon",
  },
  "gen-orbite": {
    poster: "/media/orbite.jpg",
    video: "/media/orbite.mp4",
    collection: "Orbite",
  },
};
