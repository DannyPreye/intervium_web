import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Intavue — Invisible AI Interview Copilot",
    short_name: "Intavue",
    description:
      "Invisible AI interview copilot with real-time answers, mock interviews, resume tools, and a story bank.",
    start_url: "/",
    display: "standalone",
    background_color: "#08070e",
    theme_color: "#08070e",
    icons: [
      {
        src: "/intavue-app-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
