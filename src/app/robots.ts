import type { MetadataRoute } from "next";

const SITE_URL = "https://intavue.app";

// Gated app + auth routes render only empty client shells to crawlers; keep them
// out of the index to avoid thin / duplicate content. Public marketing pages,
// the free résumé tool, and the FAQ stay open.
const disallow = [
  "/dashboard",
  "/applications",
  "/billing",
  "/coding-challenge",
  "/company-intel",
  "/concept-coach",
  "/cover-letters",
  "/daily-question",
  "/debrief",
  "/interview-prep",
  "/mock-interview",
  "/resume",
  "/settings",
  "/support",
  "/story-bank",
  "/onboarding",
  "/auth/",
  "/login",
  "/register",
  "/forgot-password",
];

// Answer-engine / AI crawlers — explicitly welcomed so they can read and cite
// the marketing pages, the free résumé tool, and the FAQ (AEO). Some default
// configs accidentally block these; we opt in.
const AI_BOTS = [
  "GPTBot", // OpenAI training crawler
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT live browsing
  "ClaudeBot", // Anthropic crawler
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot", // Perplexity index
  "Perplexity-User", // Perplexity live fetch
  "Google-Extended", // Gemini / AI Overviews
  "Applebot-Extended", // Apple Intelligence
  "Amazonbot",
  "cohere-ai",
  "CCBot", // Common Crawl (feeds many LLMs)
  "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
