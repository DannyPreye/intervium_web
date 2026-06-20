import { useSyncExternalStore } from "react";
import { OS, ReleaseAssets } from "./types";
import { GITHUB_API_LATEST, GITHUB_RELEASES } from "./constants";

export async function fetchReleaseAssets(): Promise<ReleaseAssets> {
  try {
    const res = await fetch(GITHUB_API_LATEST, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok)
      return { windows: null, mac: null, linux: null, version: null };
    const data = await res.json();
    const tag: string = data.tag_name ?? "";
    const ver = tag.replace(/^v/, "");
    const base = `https://github.com/DannyPreye/intervium-releases/releases/download/${tag}`;
    const expected: Record<Exclude<OS, "unknown">, string> = {
      windows: `Intavue-${ver}-Setup.exe`,
      mac: `Intavue-${ver}.dmg`,
      linux: `Intavue-${ver}.AppImage`,
    };
    const uploaded = new Set<string>(
      ((data.assets as { name: string }[]) ?? []).map((a) => a.name),
    );
    const urlFor = (p: Exclude<OS, "unknown">) =>
      uploaded.has(expected[p]) ? `${base}/${expected[p]}` : null;
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

export function detectOS(): OS {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  return "unknown";
}

const subscribeOS = () => () => {};
const getSnapshotOS = () => detectOS();
const getServerSnapshotOS = () => "unknown" as const;

export function useOS(): OS {
  return useSyncExternalStore(subscribeOS, getSnapshotOS, getServerSnapshotOS);
}

export function useDownloadHref(assets: ReleaseAssets): string {
  const os = useOS();
  const url = os !== "unknown" ? assets[os] : null;
  return url ?? GITHUB_RELEASES;
}
