"use client";

import { GoogleLogo } from "@phosphor-icons/react";
import { API_BASE } from "@/lib/config";

/** Kicks off Google OAuth. The backend redirects to Google, then back to our
 *  /auth/callback with the tokens in the query string. */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const go = () => {
    const redirect = `${window.location.origin}/auth/callback`;
    window.location.href = `${API_BASE}/v1/auth/google?redirect=${encodeURIComponent(redirect)}`;
  };
  return (
    <button
      type="button"
      onClick={go}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-line-strong bg-bg-raised text-[14px] font-semibold text-ink transition-colors hover:border-violet/40"
    >
      <GoogleLogo size={18} weight="bold" /> {label}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-[12px] text-ink-faint">or</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
