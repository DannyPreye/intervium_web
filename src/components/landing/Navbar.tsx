"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CaretDown, List, X } from "@phosphor-icons/react";
import { ReleaseAssets, OS } from "@/lib/types";
import { useOS } from "@/lib/hooks";
import { GITHUB_RELEASES, OS_META } from "@/lib/constants";
import { session } from "@/lib/session";
import OsGlyph from "@/components/ui/OsGlyph";

const NAV_LINKS = [
  { href: "/#demo", label: "Live demo" },
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export default function Navbar({ assets }: { assets: ReleaseAssets }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const os = useOS();
  const ddRef = useRef<HTMLDivElement>(null);

  // Reflect auth state (client-only; starts false to match SSR, then syncs).
  useEffect(() => {
    const sync = () => setAuthed(session.isAuthenticated());
    sync();
    return session.onChange(sync);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onClick = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node))
        setDdOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const platforms: Exclude<OS, "unknown">[] = ["windows", "mac"];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled || open
            ? "border-b border-line bg-bg/85 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
      <div className="container-x flex h-[68px] items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <Image src="/mark.png" alt="Intavue" width={32} height={32} className="h-8 w-8" />
          <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-ink">
            Intavue
          </span>
        </a>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-5 md:flex">
        {!authed && (
          <a
            href="/login"
            className="text-[14px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Sign in
          </a>
        )}
        <div ref={ddRef} className="relative">
          <button
            onClick={() => setDdOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={ddOpen}
            aria-label="Download Intavue"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-white/[0.04] hover:text-ink"
          >
            <OsGlyph os={os} size={16} />
            Download
            <CaretDown
              size={13}
              weight="bold"
              className={`transition-transform ${ddOpen ? "rotate-180" : ""}`}
            />
          </button>
          {ddOpen && (
            <div
              role="menu"
              aria-label="Download by platform"
              className="absolute top-[calc(100%+10px)] right-0 w-64 overflow-hidden rounded-2xl border border-line-strong bg-bg-elevated shadow-2xl shadow-black/60"
            >
              {platforms.map((p, i) => {
                const url = assets[p];
                const here = p === os;
                return (
                  <a
                    key={p}
                    href={url ?? GITHUB_RELEASES}
                    onClick={() => setDdOpen(false)}
                    role="menuitem"
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      here ? "bg-violet/10" : "hover:bg-white/[0.04]"
                    } ${
                      i !== platforms.length - 1 ? "border-b border-line" : ""
                    } ${url ? "" : "opacity-50"}`}
                  >
                    <span
                      className={here ? "text-violet-bright" : "text-ink-faint"}
                    >
                      <OsGlyph os={p} size={18} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13px] font-semibold text-ink">
                        {OS_META[p].label}
                      </span>
                      <span className="block text-[11px] text-ink-faint">
                        {url ? OS_META[p].sublabel : "Coming soon"}
                      </span>
                    </span>
                    {here && url && (
                      <span className="font-mono text-[9px] font-bold tracking-wider text-violet-bright uppercase">
                        You
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <a
          href={authed ? "/dashboard" : "/register"}
          className="inline-flex items-center gap-2 rounded-full bg-[#6b4af0] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_6px_28px_-10px_rgba(107,74,240,0.8)] transition-transform hover:-translate-y-0.5"
        >
          {authed ? "Dashboard" : "Start free"}
        </a>
        </div>

        <button
          className="text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <List size={26} />}
        </button>
      </div>
    </header>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[68px] bottom-0 z-40 flex flex-col gap-8 overflow-y-auto bg-bg px-6 py-8 md:hidden"
        >
          <nav className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 font-display text-xl font-semibold text-ink"
              >
                {l.label}
              </a>
            ))}
            <a
              href={authed ? "/dashboard" : "/login"}
              onClick={() => setOpen(false)}
              className="py-4 font-display text-xl font-semibold text-violet-bright"
            >
              {authed ? "Dashboard" : "Sign in"}
            </a>
          </nav>
          {!authed && (
            <a
              href="/register"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-[#6b4af0] px-5 py-3.5 text-[15px] font-semibold text-white"
            >
              Start free in your browser
            </a>
          )}
          <div className="mt-auto flex flex-col gap-3">
            <p className="text-sm text-ink-soft">
              Prefer the desktop app? Download for:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {platforms.map((p) => (
                <a
                  key={p}
                  href={assets[p] ?? GITHUB_RELEASES}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold ${
                    p === os
                      ? "bg-[#6b4af0] text-white"
                      : "border border-line-strong text-ink"
                  }`}
                >
                  <OsGlyph os={p} size={16} />
                  {p[0].toUpperCase() + p.slice(1)}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>

  );
}
