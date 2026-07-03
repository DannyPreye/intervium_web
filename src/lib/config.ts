/** Backend base URL. Override per-env with NEXT_PUBLIC_API_BASE. */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || "https://interview--backend.fly.dev"
).replace(/\/$/, "");
