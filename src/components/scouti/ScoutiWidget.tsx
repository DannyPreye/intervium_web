"use client";

/* Scouti feedback widget. Mounted once in the root layout. It:
 *  - loads the widget only after the visitor accepts cookies (consent-gated),
 *  - keeps the Scouti user identity in sync with the signed-in user,
 *  - fires proactive touchpoints at the right moments:
 *      landing_page_visitor  → first impression on the marketing home page
 *      pricing_dismissed     → viewed pricing, then scrolled on without upgrading
 *      activated_user        → returning signed-in user (power-user check-in)
 *  The reactive "tell us anything" button appears on its own once loaded.
 *  (report_bug is fired from the Support page button.) */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { consent } from "@/lib/consent";
import { session } from "@/lib/session";
import { loadScouti, mountScouti } from "@/lib/scouti";

function userIdFromToken(token: string): string | null {
  try {
    return (JSON.parse(atob(token.split(".")[1] ?? "")).sub as string) ?? null;
  } catch {
    return null;
  }
}

// Per-browser counter so we only treat someone as an "activated" returning user
// after a few visits — a brand-new user shouldn't be asked "you've used this a
// while." (The binding's 14-day cooldown limits it further, server-side.)
const APP_VISITS_KEY = "iv_app_visits";
const ACTIVATED_AFTER = 3;

export default function ScoutiWidget() {
  const pathname = usePathname();
  const loadedRef = useRef(false);
  const lastIdRef = useRef<string | null | undefined>(undefined);

  // Load (once consented) + identity sync + per-route proactive mounts.
  useEffect(() => {
    const ensureLoaded = () => {
      if (consent.accepted() && !loadedRef.current) {
        loadScouti();
        loadedRef.current = true;
      }
      return loadedRef.current;
    };

    const syncUser = () => {
      if (!loadedRef.current || !window.scouti) return;
      const token = session.access;
      const id = token ? userIdFromToken(token) : null;
      if (id !== lastIdRef.current) {
        lastIdRef.current = id;
        // Empty identifier → anonymous (e.g. after logout).
        window.scouti.setUser({ identifier: id ?? "" });
      }
    };

    const runMounts = () => {
      if (!loadedRef.current || !window.scouti || !pathname) return;

      // landing_page_visitor is NOT fired here — firing it on load pops the
      // panel open over the hero. It's gated behind real engagement below.

      if (pathname.startsWith("/dashboard") && session.isAuthenticated()) {
        const visits = Number(localStorage.getItem(APP_VISITS_KEY) ?? "0") + 1;
        localStorage.setItem(APP_VISITS_KEY, String(visits));
        if (visits >= ACTIVATED_AFTER) mountScouti("activated_user");
      }
    };

    if (ensureLoaded()) {
      syncUser();
      runMounts();
    }

    const offConsent = consent.onChange(() => {
      if (ensureLoaded()) {
        syncUser();
        runMounts();
      }
    });
    const offSession = session.onChange(syncUser);
    return () => {
      offConsent();
      offSession();
    };
  }, [pathname]);

  // Landing first-impression ask — deliberately NOT on load (that pops a panel
  // over the hero). Fire only once the visitor has actually engaged: either a
  // 40s dwell or scrolling past the fold, whichever comes first. By then they've
  // "looked around", which is exactly what this topic is meant to catch.
  useEffect(() => {
    if (pathname !== "/") return;

    let fired = false;
    const fire = () => {
      if (fired || !loadedRef.current || !window.scouti) return;
      fired = true;
      mountScouti("landing_page_visitor");
      cleanup();
    };

    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.75) fire();
    };
    const timer = window.setTimeout(fire, 40_000);
    window.addEventListener("scroll", onScroll, { passive: true });

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, [pathname]);

  // Pricing "looked but didn't upgrade": fire once the pricing section has been
  // seen and then scrolled back out of view. (Backend samples this at 20%.)
  useEffect(() => {
    if (pathname !== "/") return;
    const el = document.getElementById("pricing");
    if (!el) return;

    let seen = false;
    let fired = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            seen = true;
          } else if (seen && !fired && loadedRef.current && window.scouti) {
            fired = true;
            mountScouti("pricing_dismissed");
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
