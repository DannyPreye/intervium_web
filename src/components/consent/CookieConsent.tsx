"use client";

/* Cookie consent banner. Shown once, until the visitor accepts or rejects.
 * Choice is persisted in localStorage via `consent`; analytics (Mixpanel +
 * Clarity, see Analytics.tsx) only initialize after "accepted". Rendered from
 * the root layout, so it appears on every page until a choice is made. */

import { useEffect, useState } from "react";
import Link from "next/link";
import { consent, type ConsentValue } from "@/lib/consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only surface once mounted (avoids SSR flash) and only if no prior choice.
    setShow(consent.get() === null);
  }, []);

  if (!show) return null;

  const decide = (v: ConsentValue) => {
    consent.set(v);
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4 sm:left-auto sm:right-4 sm:max-w-sm animate-[cc-rise_.35s_ease-out]"
    >
      <div className="rounded-2xl border border-line-strong bg-bg-elevated/95 p-5 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            🍪
          </span>
          <h2 className="font-display text-sm font-semibold text-ink">
            Cookies &amp; analytics
          </h2>
        </div>
        <p className="text-[13px] leading-relaxed text-ink-soft">
          We use analytics cookies to understand how Intavue is used and improve
          it. Essential cookies (sign-in) are always on. See our{" "}
          <Link
            href="/privacy"
            className="text-violet-bright underline underline-offset-2 hover:text-ink"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="flex-1 rounded-lg border border-line-strong px-3 py-2 text-[13px] font-medium text-ink-soft transition-colors hover:bg-bg-raised hover:text-ink"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="flex-1 rounded-lg bg-[var(--cta)] px-3 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
