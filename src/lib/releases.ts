import { OS, ReleaseAssets } from "./types";

// Defined locally (not imported from ./constants) so this server module doesn't
// pull constants.ts — which imports phosphor icons — into the RSC server graph.
const GITHUB_API_LATEST =
  "https://api.github.com/repos/DannyPreye/intervium-releases/releases/latest";

/* Server-side release lookup. Runs on the server (cached for an hour) instead of
 * in every visitor's browser — the old client fetch hit GitHub's unauthenticated
 * API (rate-limited to 60/hr per IP) on every page load and delayed the download
 * links. Fetching here means the landing page ships fully-rendered with the links
 * already in place, and the homepage can be a fast server component. */
export async function getReleaseAssets(): Promise<ReleaseAssets> {
  try {
    const res = await fetch(GITHUB_API_LATEST, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { windows: null, mac: null, linux: null, version: null };
    const data = await res.json();
    const tag: string = data.tag_name ?? "";
    const ver = tag.replace(/^v/, "");
    const base = `https://github.com/DannyPreye/intervium-releases/releases/download/${tag}`;
    const expected: Record<Exclude<OS, "unknown">, string> = {
      windows: `Intavue-${ver}-Setup.exe`,
      mac: `Intavue-${ver}.dmg`,
      linux: `Intavue-${ver}.AppImage`,
    };
    const uploaded = new Set<string>(((data.assets as { name: string }[]) ?? []).map((a) => a.name));
    const urlFor = (p: Exclude<OS, "unknown">) => (uploaded.has(expected[p]) ? `${base}/${expected[p]}` : null);
    return {
      windows: urlFor("windows"),
      mac: urlFor("mac"),
      linux: urlFor("linux"),
      version: tag || null,
    };
  } catch {
    return { windows: null, mac: null, linux: null, version: null };
  }
}
