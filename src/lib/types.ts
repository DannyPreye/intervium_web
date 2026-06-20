export type OS = "windows" | "mac" | "linux" | "unknown";

export interface ReleaseAssets {
  windows: string | null;
  mac: string | null;
  linux: string | null;
  version: string | null;
}
