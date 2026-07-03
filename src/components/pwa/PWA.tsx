"use client";

import { useEffect, useState } from "react";
import { DownloadSimple, X } from "@phosphor-icons/react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Registers the service worker and shows a tasteful, dismissible install
 *  prompt when the browser offers one (Android/desktop Chrome/Edge). */
export default function PWA() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const onLoad = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
      window.addEventListener("load", onLoad);
      // Also register immediately if the page is already loaded.
      if (document.readyState === "complete") onLoad();
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  useEffect(() => {
    const seen = typeof window !== "undefined" && localStorage.getItem("iv_install_dismissed");
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      if (!seen) setDismissed(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setDismissed(true);
  };

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem("iv_install_dismissed", "1");
    } catch {}
  };

  if (dismissed || !deferred) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line-strong bg-bg-elevated/95 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl sm:left-auto sm:right-4">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--cta)] text-white">
        <DownloadSimple size={20} weight="bold" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-ink">Install Intavue</p>
        <p className="text-[12px] text-ink-soft">Add it to your device for a full-screen app.</p>
      </div>
      <button
        onClick={install}
        className="shrink-0 rounded-full bg-[var(--cta)] px-4 py-2 text-[13px] font-semibold text-white hover:brightness-110"
      >
        Install
      </button>
      <button onClick={close} aria-label="Dismiss" className="shrink-0 text-ink-faint hover:text-ink">
        <X size={16} />
      </button>
    </div>
  );
}
