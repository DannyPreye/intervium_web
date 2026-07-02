import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Intavue — AI Interview Prep & Coaching",
    short_name: "Intavue",
    description:
      "AI interview prep with real-time voice mock interviews, a concept coach, resume tools, and a story bank.",
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
        src: "/intavue-app-icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
