"use client";

// Web-native session: Bearer tokens in localStorage (the API is stateless /
// token-based, so no cookies). A custom event lets the shell react to login /
// logout without a full reload.
const ACCESS = "iv_access";
const REFRESH = "iv_refresh";
const EVENT = "iv-auth-change";

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export const session = {
  get access(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS);
  },
  get refresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH);
  },
  set(access: string, refresh?: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS, access);
    if (refresh) localStorage.setItem(REFRESH, refresh);
    emit();
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    emit();
  },
  isAuthenticated(): boolean {
    const t = this.access;
    if (!t) return false;
    try {
      const payload = JSON.parse(atob(t.split(".")[1]!));
      return Date.now() < (payload.exp as number) * 1000;
    } catch {
      return false;
    }
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
