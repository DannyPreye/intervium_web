"use client";

/* Analytics: Mixpanel (events/funnels, with autocapture so clicks, inputs and
 * form submits are tracked automatically) + Microsoft Clarity (full session
 * recordings + heatmaps). Both are no-ops until their env keys are set, so the
 * app runs fine locally/without keys.
 *
 *   NEXT_PUBLIC_MIXPANEL_TOKEN      — Mixpanel project token
 *   NEXT_PUBLIC_CLARITY_PROJECT_ID  — Clarity project id
 */

import mixpanel from "mixpanel-browser";
import Clarity from "@microsoft/clarity";

const MP_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

let ready = false;

export function initAnalytics() {
  if (ready || typeof window === "undefined") return;
  ready = true;

  if (MP_TOKEN) {
    mixpanel.init(MP_TOKEN, {
      // Autocapture clicks, inputs and form submissions across every page.
      autocapture: true,
      // Page views are tracked manually on route change (reliable for the App
      // Router) — see components/analytics/Analytics.tsx.
      track_pageview: false,
      persistence: "localStorage",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  if (CLARITY_ID) {
    try { Clarity.init(CLARITY_ID); } catch { /* clarity blocked / offline */ }
  }
}

export function trackPage(url: string) {
  if (ready && MP_TOKEN) mixpanel.track("Page Viewed", { url, path: url.split("?")[0] });
}

export function track(event: string, props?: Record<string, unknown>) {
  if (ready && MP_TOKEN) mixpanel.track(event, props);
}

export function identifyUser(id: string, traits?: Record<string, unknown>) {
  if (!ready) return;
  if (MP_TOKEN) {
    mixpanel.identify(id);
    if (traits) {
      const clean = Object.fromEntries(Object.entries(traits).filter(([, v]) => v != null));
      if (Object.keys(clean).length) mixpanel.people.set(clean);
    }
  }
  if (CLARITY_ID) {
    try { Clarity.identify(id); } catch { /* ignore */ }
  }
}

export function resetAnalytics() {
  if (ready && MP_TOKEN) mixpanel.reset();
}
