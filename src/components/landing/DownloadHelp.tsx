"use client";

import React from "react";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react";

/** A calm, opt-in explainer for the OS warning shown on the (currently unsigned)
 * desktop build. Kept small and only placed next to download links — never a
 * site-wide banner — so it reassures the few who download without alarming
 * everyone else. */
export default function DownloadHelp({ className = "" }: { className?: string }) {
  return (
    <details className={`group max-w-md text-left ${className}`}>
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[12.5px] text-ink-faint transition-colors hover:text-ink-soft">
        <CaretDown size={12} weight="bold" className="transition-transform group-open:rotate-180" />
        Seeing a warning when you open the desktop app?
      </summary>
      <div className="mt-3 space-y-2 rounded-xl border border-line bg-bg-elevated px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
        <p>
          <span className="font-semibold text-ink">Windows:</span> on the blue SmartScreen prompt, click{" "}
          <span className="text-ink">More info → Run anyway</span>. It appears because the app is from a new
          publisher, not because anything is wrong.
        </p>
        <p>
          <span className="font-semibold text-ink">macOS:</span> right-click the app → <span className="text-ink">Open</span>,
          then confirm — or open System Settings → Privacy &amp; Security → <span className="text-ink">Open anyway</span>.
        </p>
        <p className="text-ink-faint">
          Prefer zero setup?{" "}
          <Link href="/register" className="font-medium text-violet-bright hover:underline">
            Use Intavue in your browser →
          </Link>
        </p>
      </div>
    </details>
  );
}
