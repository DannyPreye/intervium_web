import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Intavue — AI Interview Prep & Coaching",
    short_name: "Intavue",
    description:
      "AI interview prep with real-time voice mock interviews, a concept coach, resume tools, and a story bank.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#08070e",
    theme_color: "#08070e",
    categories: ["education", "productivity", "business"],
    icons: [
      { src: "/intavue-app-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/intavue-app-icon.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
      { src: "/intavue-app-icon.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Start a mock interview",
        short_name: "Mock",
        url: "/mock-interview",
      },
      {
        name: "Learn with Sage",
        short_name: "Coach",
        url: "/concept-coach",
      },
    ],
  };
}
