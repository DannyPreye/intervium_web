"use client";

/* Cookie/analytics consent. Non-essential trackers (Mixpanel, Clarity) must not
 * load until the user has accepted. `null` = no choice made yet (show banner). */

const KEY = "iv_consent";
const EVENT = "iv-consent-change";

export type ConsentValue = "accepted" | "rejected";

export const consent = {
  get(): ConsentValue | null {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  },
  set(v: ConsentValue) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, v);
    window.dispatchEvent(new Event(EVENT));
  },
  accepted(): boolean {
    return this.get() === "accepted";
  },
  onChange(cb: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    window.addEventListener(EVENT, cb);
    window.addEventListener("storage", cb);
    return () => {
      window.removeEventListener(EVENT, cb);
      window.removeEventListener("storage", cb);
    };
  },
};
