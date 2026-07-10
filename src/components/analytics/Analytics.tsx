"use client";

/* Mounted once in the root layout. Initializes Mixpanel + Clarity, tracks a
 * "Page Viewed" event on every route change, and identifies the signed-in user
 * (and resets on logout) by reacting to session changes. */

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, trackPage, identifyUser, resetAnalytics } from "@/lib/analytics";
import { session } from "@/lib/session";
import { api } from "@/lib/api";

function PageViews() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    if (!pathname) return;
    const qs = search?.toString();
    trackPage(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, search]);
  return null;
}

function userIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""));
    return (payload?.sub as string) ?? null;
  } catch {
    return null;
  }
}

export default function Analytics() {
  useEffect(() => {
    initAnalytics();

    let lastId: string | null = null;
    const sync = async () => {
      const token = session.access;
      const id = token ? userIdFromToken(token) : null;

      if (id && id !== lastId) {
        lastId = id;
        identifyUser(id);
        // Best-effort profile enrichment (email/name/plan) for Mixpanel people.
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const me = (await api<any>("/v1/user/me")) as any;
          const u = me?.data ?? me;
          identifyUser(id, { $email: u?.email, $name: u?.name, plan: u?.plan });
        } catch { /* not fatal */ }
      } else if (!id && lastId) {
        lastId = null;
        resetAnalytics();
      }
    };

    sync();
    return session.onChange(sync);
  }, []);

  return (
    <Suspense fallback={null}>
      <PageViews />
    </Suspense>
  );
}
