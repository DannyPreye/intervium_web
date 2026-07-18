"use client";

/* Scouti widget loader + helpers.
 *
 * The `pk_…` project key below is *publishable* — it's designed to live in
 * client-side HTML and is protected by Scouti's allowed-domains check, not by
 * being secret. The secret access key (`uak_…`) is never in the app; it lives
 * only in the local `scouti` CLI.
 *
 * The widget is gated behind cookie consent (see components/consent) — it holds
 * conversations with users, so it only loads once the visitor has accepted. */

export const SCOUTI_PROJECT_KEY =
  "pk_ACpnb3SJ6BhSGyJFuX8eDBHq32L0Evx0ZSWwsVhuExT1B6Qe_7zXnKuFRfQ1";
const WIDGET_SRC = "https://scouti.chat/scouti-widget.umd.js";

type ScoutiApi = {
  mount: (name: string) => void;
  setUser: (u: { identifier?: string }) => void;
  hide: () => void;
  destroy: () => void;
};

declare global {
  interface Window {
    scouti?: ScoutiApi;
    // Internals set by the official loader / real bundle.
    __sa?: ScoutiApi;
    __sr?: () => void;
  }
}

let loading = false;

// Port of Scouti's official loader (guide §4.1): registers `window.scouti` as a
// queueing proxy synchronously so early mount()/setUser() calls are held, then
// downloads the real bundle and replays the queue once it's ready. Idempotent.
export function loadScouti() {
  if (typeof window === "undefined" || loading || window.scouti) return;
  loading = true;

  let resolveReady!: () => void;
  const ready = new Promise<void>((r) => (resolveReady = r));
  window.__sr = resolveReady;

  window.scouti = new Proxy({} as ScoutiApi, {
    get:
      (_target, method: string) =>
      (...args: unknown[]) => {
        const real = window.__sa as unknown as Record<string, (...a: unknown[]) => unknown>;
        return real
          ? real[method](...args)
          : ready.then(() =>
              (window.__sa as unknown as Record<string, (...a: unknown[]) => unknown>)[method](
                ...args,
              ),
            );
      },
  }) as ScoutiApi;

  const s = document.createElement("script");
  s.async = true;
  s.src = WIDGET_SRC;
  s.setAttribute("data-project-key", SCOUTI_PROJECT_KEY);
  document.head.appendChild(s);
}

// Fire a named touchpoint. No-op until the widget is loaded (calls made while
// the bundle is still downloading are queued by the proxy above).
export function mountScouti(name: string) {
  if (typeof window !== "undefined" && window.scouti) window.scouti.mount(name);
}

// True once the widget has been (or is being) loaded — i.e. consent was given.
export function isScoutiLoaded() {
  return typeof window !== "undefined" && !!window.scouti;
}
