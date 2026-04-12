"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

type OS = "windows" | "mac" | "linux" | "unknown";

interface ReleaseAssets {
  windows: string | null;
  mac: string | null;
  linux: string | null;
  version: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// Public releases repo — source code stays in the private repo,
// only the built installers are published here.
const GITHUB_RELEASES = "https://github.com/DannyPreye/intervium-releases/releases/latest";
const GITHUB_API_LATEST = "https://api.github.com/repos/DannyPreye/intervium-releases/releases/latest";

const OS_META: Record<Exclude<OS, "unknown">, { label: string; ext: string; sublabel: string }> = {
  windows: { label: "Download for Windows", ext: ".exe", sublabel: "Windows 10/11 · 64-bit" },
  mac:     { label: "Download for macOS",   ext: ".dmg", sublabel: "macOS 12+ · Intel & Apple Silicon" },
  linux:   { label: "Download for Linux",   ext: ".AppImage", sublabel: "AppImage · x86_64" },
};

// ── GitHub API ────────────────────────────────────────────────────────────────
// Artifact names as defined in electron-builder.yml:
//   Windows NSIS : Intervium-{ver}-Setup.exe
//   macOS DMG    : Intervium-{ver}.dmg
//   Linux AppImage: Intervium-{ver}.AppImage
//
// We build URLs from the version tag directly and cross-check against the
// actual asset list — if a platform's build failed or hasn't run yet the
// URL is null so the button shows "not yet available" instead of redirecting
// the user to a web page.

async function fetchReleaseAssets(): Promise<ReleaseAssets> {
  try {
    const res = await fetch(GITHUB_API_LATEST, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return { windows: null, mac: null, linux: null, version: null };
    const data = await res.json();

    const tag: string = data.tag_name ?? "";           // "v1.0.0"
    const ver = tag.replace(/^v/, "");                  // "1.0.0"
    const base = `https://github.com/DannyPreye/intervium-releases/releases/download/${tag}`;

    // Build the expected filenames from the known electron-builder patterns
    const expected: Record<Exclude<OS, "unknown">, string> = {
      windows: `Intervium-${ver}-Setup.exe`,
      mac:     `Intervium-${ver}.dmg`,
      linux:   `Intervium-${ver}.AppImage`,
    };

    // Index the real uploaded assets so we can confirm each file exists
    const uploaded = new Set<string>(
      (data.assets as { name: string }[] ?? []).map((a) => a.name)
    );

    const urlFor = (p: Exclude<OS, "unknown">) =>
      uploaded.has(expected[p]) ? `${base}/${expected[p]}` : null;

    return {
      windows: urlFor("windows"),
      mac:     urlFor("mac"),
      linux:   urlFor("linux"),
      version: tag || null,
    };
  } catch {
    return { windows: null, mac: null, linux: null, version: null };
  }
}

function detectOS(): OS {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "mac";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "unknown";
}

// ── SVG icons ─────────────────────────────────────────────────────────────────

const Icon = {
  Sparkles: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75L19 15z"/>
      <path d="M5 3l.5 1.5L7 5l-1.5.5L5 7l-.5-1.5L3 5l1.5-.5L5 3z"/>
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="9" y="2" width="6" height="12" rx="3"/>
      <path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  ),
  FileSearch: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
      <circle cx="11" cy="14" r="2"/><line x1="13" y1="16" x2="15" y2="18"/>
    </svg>
  ),
  MessagePlus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/>
    </svg>
  ),
  Code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/>
    </svg>
  ),
  Building: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="9" width="18" height="12" rx="2"/><path d="M8 21V9"/><path d="M16 21V9"/>
      <path d="M3 9l9-6 9 6"/>
    </svg>
  ),
  DollarSign: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  ClipboardList: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  BookOpen: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
  Download: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Windows: () => (
    <svg viewBox="0 0 88 88" fill="currentColor" className="w-4 h-4">
      <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.011 41.34-47.318-6.678-.066-34.739z"/>
    </svg>
  ),
  Apple: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  ),
  Linux: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12.504 0c-.155 0-.315.008-.48.021C7.309.358 4.656 3.474 4.53 6.531c-.136 3.448 1.408 6.152 4.498 7.777l.127.068c.577.304 1.05.55 1.348.89.296.33.405.78.46 1.34.15 1.545-.508 2.932-1.728 3.85-1.167.885-2.714 1.138-4.044.65-1.346-.493-2.358-1.633-2.675-3.058-.205-.923-.134-1.873.258-2.74C3.48 14.04 5.113 12.61 7 12a.5.5 0 00-.078-.993c-2.264.69-4.23 2.408-4.975 4.7-.743 2.288-.144 4.812 1.567 6.48 1.614 1.57 3.966 2.27 6.22 1.84 2.284-.437 4.26-1.96 5.178-4.026.77-1.744.682-3.742-.21-5.376-.497-.91-1.182-1.65-2.025-2.2a9.5 9.5 0 00-.47-.286c-1.84-.994-2.93-2.71-2.8-4.75.13-2.04 1.54-3.74 3.59-4.19.49-.11.98-.14 1.47-.09 2.27.23 4.03 1.94 4.44 4.17.11.6.11 1.22-.01 1.82-.27 1.36-1.03 2.5-2.07 3.19a.5.5 0 00.54.84c1.32-.85 2.3-2.28 2.64-3.94.18-.9.18-1.82.01-2.72-.51-2.82-2.76-4.97-5.62-5.27-.26-.026-.52-.04-.78-.04z"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
    </svg>
  ),
  Zap: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="23,4 23,10 17,10"/><polyline points="1,20 1,14 7,14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  ),
};

// ── OS icon helper ────────────────────────────────────────────────────────────

function OsIcon({ os }: { os: OS }) {
  if (os === "windows") return <Icon.Windows />;
  if (os === "mac") return <Icon.Apple />;
  if (os === "linux") return <Icon.Linux />;
  return <Icon.Download />;
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ assets }: { assets: ReleaseAssets }) {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [detectedOS, setDetectedOS] = useState<OS>("unknown");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDetectedOS(detectOS());
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const platforms: Exclude<OS, "unknown">[] = ["windows", "mac", "linux"];

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all 0.3s",
        backgroundColor: scrolled ? "rgba(6,8,15,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image
              src="/intervium_logo.png"
              alt="Intervium Logo"
              width={32}
              height={32}
              style={{ borderRadius: 8, objectFit: "contain" }}
            />
            <span style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              Intervium
            </span>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
              { href: "#pricing", label: "Pricing" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: 14, fontWeight: 500, color: "rgba(148,163,184,1)",
                  textDecoration: "none", transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#f1f5f9")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(148,163,184,1)")}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Download dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 8,
                background: "#6366f1", color: "#fff",
                fontWeight: 600, fontSize: 13, border: "none",
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: "0 0 16px rgba(99,102,241,0.35)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#4f46e5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#6366f1")}
            >
              <OsIcon os={detectedOS} />
              Download
              <Icon.ChevronDown />
            </button>

            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                minWidth: 240, borderRadius: 12,
                background: "#0d1117",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                overflow: "hidden", zIndex: 100,
              }}>
                {platforms.map((p) => {
                  const meta = OS_META[p];
                  const url = assets[p];
                  const available = url !== null;
                  const isDetected = p === detectedOS;
                  return (
                    <button
                      key={p}
                      disabled={!available}
                      onClick={() => {
                        if (!available) return;
                        setDropdownOpen(false);
                        window.location.href = url;
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, width: "100%",
                        padding: "12px 16px", textDecoration: "none", border: "none",
                        background: isDetected ? "rgba(99,102,241,0.1)" : "transparent",
                        cursor: available ? "pointer" : "default",
                        opacity: available ? 1 : 0.45,
                        transition: "background 0.15s",
                        borderBottom: p !== "linux" ? "1px solid rgba(255,255,255,0.05)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (available && !isDetected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = isDetected ? "rgba(99,102,241,0.1)" : "transparent";
                      }}
                    >
                      <span style={{ color: isDetected ? "#818cf8" : "rgba(100,116,139,1)", flexShrink: 0 }}>
                        <OsIcon os={p} />
                      </span>
                      <div style={{ textAlign: "left" }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: isDetected ? "#f1f5f9" : "rgba(148,163,184,1)",
                        }}>
                          {meta.label}
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(71,85,105,1)", marginTop: 1 }}>
                          {available ? meta.sublabel : "Coming soon"}
                        </div>
                      </div>
                      {isDetected && available && (
                        <span style={{
                          marginLeft: "auto", fontSize: 10, fontWeight: 700,
                          color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>
                          Recommended
                        </span>
                      )}
                    </button>
                  );
                })}
                {assets.version && (
                  <div style={{
                    padding: "8px 16px", fontSize: 11,
                    color: "rgba(51,65,85,1)", borderTop: "1px solid rgba(255,255,255,0.05)",
                    textAlign: "right",
                  }}>
                    Latest: {assets.version} · Free to download
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Hero Download Button ───────────────────────────────────────────────────────

function DownloadButton({ assets, size = "large" }: { assets: ReleaseAssets; size?: "large" | "small" }) {
  const [os, setOS] = useState<OS>("unknown");
  useEffect(() => setOS(detectOS()), []);

  const meta = os !== "unknown" ? OS_META[os] : null;
  const primaryUrl = os !== "unknown" ? assets[os] : null;
  const label = meta?.label ?? "Download Free";
  const available = primaryUrl !== null;

  const triggerDownload = (url: string) => { window.location.href = url; };

  if (size === "small") {
    return (
      <button
        disabled={!available}
        onClick={() => available && triggerDownload(primaryUrl)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 8,
          background: "#6366f1", color: "#fff",
          fontWeight: 600, fontSize: 13, border: "none",
          cursor: available ? "pointer" : "default",
          opacity: available ? 1 : 0.6,
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { if (available) (e.currentTarget as HTMLElement).style.background = "#4f46e5"; }}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#6366f1")}
      >
        <Icon.Download /> {available ? label : "Coming soon"}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <button
        disabled={!available}
        onClick={() => available && triggerDownload(primaryUrl)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "14px 32px", borderRadius: 12,
          background: available
            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
            : "rgba(99,102,241,0.3)",
          color: "#fff", fontWeight: 700, fontSize: 16, border: "none",
          cursor: available ? "pointer" : "default",
          transition: "all 0.2s",
          boxShadow: available ? "0 4px 32px rgba(99,102,241,0.4)" : "none",
          letterSpacing: "-0.01em",
        }}
        onMouseEnter={(e) => {
          if (!available) return;
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 40px rgba(99,102,241,0.5)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = "";
          el.style.boxShadow = available ? "0 4px 32px rgba(99,102,241,0.4)" : "none";
        }}
      >
        <OsIcon os={os} />
        {available ? label : "Download coming soon"}
      </button>

      {/* Other platforms */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <span style={{ fontSize: 12, color: "rgba(71,85,105,1)" }}>Also for:</span>
        {(["windows", "mac", "linux"] as const).filter((p) => p !== os).map((p) => {
          const url = assets[p];
          return (
            <button
              key={p}
              disabled={!url}
              onClick={() => url && triggerDownload(url)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 12, color: url ? "rgba(100,116,139,1)" : "rgba(71,85,105,0.6)",
                background: "none", border: "none",
                cursor: url ? "pointer" : "default",
                padding: 0, transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { if (url) (e.currentTarget as HTMLElement).style.color = "#f1f5f9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = url ? "rgba(100,116,139,1)" : "rgba(71,85,105,0.6)"; }}
            >
              <OsIcon os={p} />
              {p.charAt(0).toUpperCase() + p.slice(1)}
              {!url && <span style={{ fontSize: 10, color: "rgba(71,85,105,0.6)", marginLeft: 2 }}>(soon)</span>}
            </button>
          );
        })}
      </div>

      <span style={{ fontSize: 11, color: "rgba(51,65,85,1)" }}>
        {assets.version ? `${assets.version} · ` : ""}Free to download · No credit card required
      </span>
    </div>
  );
}

// ── App Window Mockup ─────────────────────────────────────────────────────────

function AppMockup() {
  return (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.09)",
      background: "#0d1117",
      boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
      maxWidth: 600,
    }}>
      {/* Title bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
        background: "#0a0e18", borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
        <span style={{
          flex: 1, textAlign: "center", fontSize: 11,
          color: "rgba(100,116,139,1)", fontFamily: "var(--font-geist-mono)",
        }}>
          Intervium — AI Interview Coach
        </span>
      </div>

      {/* App body */}
      <div style={{ display: "flex", height: 380 }}>
        {/* Sidebar */}
        <div style={{
          width: 52, background: "#090d16",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "16px 0", gap: 6,
        }}>
          {[true, false, false, false, false, false].map((active, i) => (
            <div key={i} style={{
              width: 34, height: 34, borderRadius: 8,
              background: active ? "rgba(99,102,241,0.2)" : "transparent",
              border: active ? "1px solid rgba(99,102,241,0.4)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: 3,
                background: active ? "rgba(129,140,248,0.8)" : "rgba(100,116,139,0.3)",
              }} />
            </div>
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ width: 140, height: 13, borderRadius: 6, background: "rgba(255,255,255,0.12)" }} />
              <div style={{ width: 90, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)", marginTop: 7 }} />
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 7,
              background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)",
              fontSize: 11, color: "#818cf8", fontWeight: 600,
            }}>
              New Session
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Sessions", val: "24" },
              { label: "Avg Score", val: "8.2" },
              { label: "Streak", val: "7d" },
            ].map(({ label, val }) => (
              <div key={label} style={{
                flex: 1, padding: "10px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{val}</div>
                <div style={{ fontSize: 10, color: "rgba(71,85,105,1)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Chat bubbles */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "hidden" }}>
            {[
              { side: "left", text: "Tell me about a time you led a team through a difficult deadline." },
              { side: "right", text: "At my last company, I led a 4-person team on a critical migration..." },
              { side: "left", text: "Strong opening. Add quantified impact — e.g. 'delivered 2 weeks early'.", accent: true },
            ].map(({ side, text, accent }, i) => (
              <div key={i} style={{ display: "flex", justifyContent: side === "left" ? "flex-start" : "flex-end" }}>
                <div style={{
                  maxWidth: "75%", padding: "8px 12px", borderRadius: 10,
                  fontSize: 11, lineHeight: 1.5,
                  background: accent ? "rgba(99,102,241,0.15)" : side === "left" ? "rgba(255,255,255,0.06)" : "rgba(99,102,241,0.2)",
                  border: accent ? "1px solid rgba(99,102,241,0.3)" : side === "left" ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(99,102,241,0.3)",
                  color: accent ? "#a5b4fc" : "rgba(148,163,184,1)",
                }}>
                  {text}
                </div>
              </div>
            ))}
          </div>

          {/* Input bar */}
          <div style={{
            display: "flex", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: "rgba(99,102,241,0.8)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#fff", opacity: 0.9 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Features data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Icon.Mic,
    title: "AI Interview Practice",
    description: "Practice behavioral and technical interviews with AI-generated questions tailored to your target role. Get instant, structured feedback on every answer.",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    icon: Icon.FileSearch,
    title: "Resume Analyzer & Builder",
    description: "Get your resume ATS-scored and optimized with specific suggestions. Then rebuild it from scratch using 5 professional templates with PDF export.",
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.1)",
    border: "rgba(56,189,248,0.2)",
  },
  {
    icon: Icon.MessagePlus,
    title: "Cover Letter Generator",
    description: "Generate tailored cover letters and cold outreach messages for any job in seconds. Always personalized to the role, never generic.",
    color: "#f472b6",
    bg: "rgba(244,114,182,0.1)",
    border: "rgba(244,114,182,0.2)",
  },
  {
    icon: Icon.Code,
    title: "Coding Challenges",
    description: "Sharpen your DSA skills with an integrated code editor. Supports Python, JavaScript, Java, and C++. Submit for detailed AI feedback on your solution.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    icon: Icon.Building,
    title: "Company Intelligence",
    description: "Get a deep research brief on any company — culture, interview process, common questions, salary ranges, and red flags — before you walk in.",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.2)",
  },
  {
    icon: Icon.DollarSign,
    title: "Salary Negotiation Coach",
    description: "Roleplay salary conversations with an AI acting as your employer. Practice initial offers, counter-offers, competing offers, and promotion discussions.",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    border: "rgba(99,102,241,0.2)",
  },
  {
    icon: Icon.ClipboardList,
    title: "Application Tracker",
    description: "Track every job application through your pipeline — from applied to offer. Search, filter, and see your stats across every company you've pursued.",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.1)",
    border: "rgba(251,146,60,0.2)",
  },
  {
    icon: Icon.BookOpen,
    title: "Story Bank & Daily Questions",
    description: "Build a library of STAR-format behavioral stories you can pull from in any interview. Plus one AI-curated question every day to keep your skills sharp.",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.2)",
  },
];

// ── Pricing ───────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    credits: "50 starter credits",
    description: "Everything you need to explore the platform and run your first practice sessions.",
    features: [
      "50 credits on signup — no card needed",
      "AI interview practice sessions",
      "Resume analysis",
      "Daily question + Story Bank",
      "Application tracker",
    ],
    cta: "Download Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/ month",
    credits: "1,000 credits / month",
    description: "For serious job seekers who need consistent, unlimited AI-powered prep.",
    features: [
      "1,000 credits every billing cycle",
      "Unlimited interview practice",
      "Resume analyzer + 5-template builder",
      "Cover letter & outreach generator",
      "Coding challenges with AI feedback",
      "Company intelligence briefs",
      "Salary negotiation coaching",
      "Interview debrief analysis",
    ],
    cta: "Get Pro",
    highlight: true,
  },
  {
    name: "Top-Up",
    price: "from $5",
    period: "one-time",
    credits: "100 – 500 credits",
    description: "Need a credit boost without a subscription? Top-up packs never expire.",
    features: [
      "100 credits for $5",
      "500 credits for $10",
      "Credits never expire",
      "Stack on any plan",
      "Pay via Stripe or Paystack (Nigeria)",
    ],
    cta: "Buy Credits",
    highlight: false,
  },
];

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Download & Sign In",
    description: "Install the app on Windows, macOS, or Linux. Create your account and sign in — takes under two minutes.",
  },
  {
    number: "02",
    title: "Build Your Profile",
    description: "Upload your resume and fill in your career targets. Intervium uses this as the foundation for every personalized AI response.",
  },
  {
    number: "03",
    title: "Practice & Prepare",
    description: "Run mock interviews, analyze your resume, generate cover letters, or research your next target company — all from one dashboard.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [assets, setAssets] = useState<ReleaseAssets>({ windows: null, mac: null, linux: null, version: null });

  useEffect(() => {
    fetchReleaseAssets().then(setAssets);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)", color: "var(--foreground)" }}>
      <Navbar assets={assets} />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", overflow: "hidden",
        paddingTop: 160, paddingBottom: 120, textAlign: "center",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)",
        }} />
        <div className="bg-grid" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 70%)",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 99,
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
            marginBottom: 24,
          }}>
            <Icon.Sparkles />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#818cf8", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              AI-Powered Interview Coach
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, letterSpacing: "-0.04em",
            lineHeight: 1.05, marginBottom: 20,
            background: "linear-gradient(180deg, #f1f5f9 0%, rgba(148,163,184,0.7) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Ace Every Interview<br />
            <span style={{
              background: "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              with Your AI Coach
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.6, color: "rgba(100,116,139,1)",
            maxWidth: 560, margin: "0 auto 40px", fontWeight: 400,
          }}>
            Practice mock interviews, optimize your resume, generate cover letters, track applications, and research companies — everything in one desktop app.
          </p>

          {/* Download CTA */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 80 }}>
            <DownloadButton assets={assets} />
          </div>

          {/* App mockup */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", inset: -40, zIndex: -1,
                background: "radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 70%)",
                filter: "blur(20px)",
              }} />
              <AppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "100px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Everything you need
            </p>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.1, color: "#f1f5f9", marginBottom: 16,
            }}>
              One app. Every edge.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(100,116,139,1)", maxWidth: 480, margin: "0 auto" }}>
              Eight AI-powered tools that cover every stage of your job search, from first application to final offer.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {FEATURES.map(({ icon: FeatureIcon, title, description, color, bg, border }) => (
              <div
                key={title}
                style={{
                  padding: 24, borderRadius: 16, background: "var(--bg-surface)",
                  border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.25s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = border; el.style.background = "#0f1420"; el.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(255,255,255,0.06)"; el.style.background = "var(--bg-surface)"; el.style.transform = "";
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10, marginBottom: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: bg, border: `1px solid ${border}`, color,
                }}>
                  <FeatureIcon />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(100,116,139,1)" }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{
        padding: "100px 0",
        background: "linear-gradient(180deg, transparent 0%, rgba(13,17,23,0.8) 50%, transparent 100%)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Get started in minutes
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#f1f5f9" }}>
              Simple as 1, 2, 3
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 40, alignItems: "start" }}>
            {STEPS.map(({ number, title, description }, i) => (
              <div key={number} style={{ position: "relative", textAlign: "center" }}>
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: "absolute", top: 28, left: "calc(50% + 48px)", right: "-50%",
                    height: 1, background: "linear-gradient(90deg, rgba(99,102,241,0.4), rgba(99,102,241,0.05))",
                  }} />
                )}
                <div style={{
                  width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
                  fontSize: 18, fontWeight: 800, color: "#818cf8", fontFamily: "var(--font-geist-mono)",
                }}>
                  {number}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(100,116,139,1)" }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CREDIT EXPLAINER ── */}
      <section style={{ padding: "80px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px" }}>
          <div style={{
            padding: "40px 48px", borderRadius: 20,
            background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 32, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Icon.Zap />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    How Credits Work
                  </span>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 10, letterSpacing: "-0.02em" }}>
                  Pay only for what you use
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(100,116,139,1)" }}>
                  Every AI action deducts a small number of credits. Subscription credits reset each billing cycle. Top-up credits never expire and stack with your plan.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, minWidth: 280 }}>
                {[
                  { label: "Interview Practice",   cost: "1 cr / min" },
                  { label: "Resume Analysis",       cost: "5 credits" },
                  { label: "Optimized Resume",      cost: "5 credits" },
                  { label: "Cover Letter",          cost: "5 credits" },
                  { label: "Coding Challenge",      cost: "3 credits" },
                  { label: "Company Brief",         cost: "3 credits" },
                  { label: "Interview Debrief",     cost: "3 credits" },
                  { label: "Solution Feedback",     cost: "2 credits" },
                ].map(({ label, cost }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", borderRadius: 8,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <span style={{ fontSize: 11, color: "rgba(148,163,184,1)" }}>{label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", whiteSpace: "nowrap", marginLeft: 8 }}>{cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "100px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Transparent pricing
            </p>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.1, color: "#f1f5f9", marginBottom: 16,
            }}>
              Start free. Scale when ready.
            </h2>
            <p style={{ fontSize: 16, color: "rgba(100,116,139,1)", maxWidth: 440, margin: "0 auto" }}>
              No hidden fees. No surprise charges. You always know exactly what you&apos;re paying for.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "stretch" }}>
            {PLANS.map(({ name, price, period, credits, description, features, cta, highlight }) => (
              <div
                key={name}
                style={{
                  position: "relative", padding: 32, borderRadius: 20,
                  display: "flex", flexDirection: "column",
                  background: highlight ? "rgba(99,102,241,0.07)" : "var(--bg-surface)",
                  border: highlight ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: highlight ? "0 0 48px rgba(99,102,241,0.12)" : "none",
                }}
              >
                {highlight && (
                  <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    padding: "4px 14px", borderRadius: 99,
                    background: "#6366f1", color: "#fff",
                    fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>{name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em",
                      color: highlight ? "#a5b4fc" : "#f1f5f9",
                    }}>{price}</span>
                    <span style={{ fontSize: 14, color: "rgba(100,116,139,1)", fontWeight: 500 }}>{period}</span>
                  </div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 10px", borderRadius: 7,
                    background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: 12,
                  }}>
                    <Icon.Zap />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8" }}>{credits}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(100,116,139,1)", lineHeight: 1.5 }}>{description}</p>
                </div>

                <ul style={{ flex: 1, listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ marginTop: 2, flexShrink: 0, color: highlight ? "#818cf8" : "#34d399" }}>
                        <Icon.Check />
                      </span>
                      <span style={{ fontSize: 13, color: "rgba(148,163,184,1)", lineHeight: 1.4 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={GITHUB_RELEASES}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "12px 24px", borderRadius: 10,
                    background: highlight ? "#6366f1" : "rgba(255,255,255,0.05)",
                    border: highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                    color: highlight ? "#fff" : "#94a3b8",
                    fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "all 0.2s",
                    boxShadow: highlight ? "0 4px 20px rgba(99,102,241,0.35)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    if (highlight) { el.style.background = "#4f46e5"; }
                    else { el.style.background = "rgba(255,255,255,0.08)"; el.style.color = "#f1f5f9"; }
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    if (highlight) { el.style.background = "#6366f1"; }
                    else { el.style.background = "rgba(255,255,255,0.05)"; el.style.color = "#94a3b8"; }
                  }}
                >
                  {cta} <Icon.ArrowRight />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section style={{
        padding: "64px 0", borderTop: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(13,17,23,0.6)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 48 }}>
            {[
              { icon: Icon.Star,       title: "Role-Aware AI",      body: "Every question, critique, and script is generated based on your actual resume, experience level, and target role." },
              { icon: Icon.Shield,     title: "Secure & Private",   body: "Your profile, answers, and session history are encrypted and never sold or shared with third parties." },
              { icon: Icon.RefreshCw,  title: "Always Up-to-Date",  body: "The app updates itself silently in the background. You always have the latest features without lifting a finger." },
            ].map(({ icon: TIcon, title, body }) => (
              <div key={title} style={{ textAlign: "center", maxWidth: 260 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, margin: "0 auto 14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8",
                }}>
                  <TIcon />
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{title}</h4>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(100,116,139,1)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding: "120px 0",
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 70%)",
        borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.1,
            background: "linear-gradient(180deg, #f1f5f9 0%, rgba(148,163,184,0.6) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 16,
          }}>
            Your next offer is one practice session away.
          </h2>
          <p style={{ fontSize: 17, color: "rgba(100,116,139,1)", lineHeight: 1.6, marginBottom: 40 }}>
            Download Intervium free and start preparing with an AI coach that knows exactly what interviewers are looking for.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DownloadButton assets={assets} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image
                src="/intervium_logo.png"
                alt="Intervium Logo"
                width={24}
                height={24}
                style={{ borderRadius: 6, objectFit: "contain" }}
              />
              <span style={{ fontWeight: 600, fontSize: 14, color: "#94a3b8" }}>Intervium</span>
            </div>

            <div style={{ display: "flex", gap: 28 }}>
              {[
                { href: "#features", label: "Features" },
                { href: "#pricing", label: "Pricing" },
                { href: GITHUB_RELEASES, label: "Download" },
                { href: "https://github.com/DannyPreye/intervium-releases/releases", label: "All Releases" },
              ].map(({ href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  style={{ fontSize: 13, color: "rgba(71,85,105,1)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#94a3b8")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(71,85,105,1)")}
                >
                  {label}
                </a>
              ))}
            </div>

            <p style={{ fontSize: 12, color: "rgba(51,65,85,1)" }}>
              © {new Date().getFullYear()} Intervium. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
