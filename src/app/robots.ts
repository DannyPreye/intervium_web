import type { MetadataRoute } from "next";

const SITE_URL = "https://intavue.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Gated app + auth routes render only empty client shells to crawlers;
      // keep them out of the index to avoid thin / duplicate content.
      disallow: [
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
        "/story-bank",
        "/onboarding",
        "/auth/",
        "/login",
        "/register",
        "/forgot-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
