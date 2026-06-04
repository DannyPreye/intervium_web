"use client";
/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities */

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  AppleLogo as AppleLogoIcon,
  ArrowRight,
  BookOpen,
  CaretDown,
  ChatTeardropText,
  Check,
  CursorClick,
  DownloadSimple as DownloadSimpleIcon,
  EyeSlash,
  FileMagnifyingGlass,
  LinuxLogo as LinuxLogoIcon,
  List,
  Lightning,
  MicrophoneStage,
  ShieldCheck,
  Sparkle,
  WindowsLogo as WindowsLogoIcon,
  X,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

// ── Types ──────────────────────────────────────────────────────────────────
type OS = "windows" | "mac" | "linux" | "unknown";

interface ReleaseAssets {
  windows: string | null;
  mac: string | null;
  linux: string | null;
  version: string | null;
}

// ── Release wiring (preserved from the original site) ───────────────────────
const GITHUB_RELEASES =
  "https://github.com/DannyPreye/intervium-releases/releases/latest";
const GITHUB_API_LATEST =
  "https://api.github.com/repos/DannyPreye/intervium-releases/releases/latest";

const OS_META: Record<
  Exclude<OS, "unknown">,
  { label: string; sublabel: string }
> = {
  windows: { label: "Download for Windows", sublabel: "Windows 10/11 · 64-bit" },
  mac: {
    label: "Download for macOS",
    sublabel: "macOS 12+ · Intel & Apple Silicon",
  },
  linux: { label: "Download for Linux", sublabel: "AppImage · x86_64" },
};

async function fetchReleaseAssets(): Promise<ReleaseAssets> {
  try {
    const res = await fetch(GITHUB_API_LATEST, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok)
      return { windows: null, mac: null, linux: null, version: null };
    const data = await res.json();
    const tag: string = data.tag_name ?? "";
    const ver = tag.replace(/^v/, "");
    const base = `https://github.com/DannyPreye/intervium-releases/releases/download/${tag}`;
    const expected: Record<Exclude<OS, "unknown">, string> = {
      windows: `Intavue-${ver}-Setup.exe`,
      mac: `Intavue-${ver}.dmg`,
      linux: `Intavue-${ver}.AppImage`,
    };
    const uploaded = new Set<string>(
      ((data.assets as { name: string }[]) ?? []).map((a) => a.name),
    );
    const urlFor = (p: Exclude<OS, "unknown">) =>
      uploaded.has(expected[p]) ? `${base}/${expected[p]}` : null;
    return {
      windows: urlFor("windows"),
      mac: urlFor("mac"),
      linux: urlFor("linux"),
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

const subscribeOS = () => () => {};
const getSnapshotOS = () => detectOS();
const getServerSnapshotOS = () => "unknown" as const;

function useOS(): OS {
  return useSyncExternalStore(subscribeOS, getSnapshotOS, getServerSnapshotOS);
}

function OsGlyph({ os, size = 16 }: { os: OS; size?: number }) {
  if (os === "windows") return <WindowsLogoIcon size={size} weight="fill" />;
  if (os === "mac") return <AppleLogoIcon size={size} weight="fill" />;
  if (os === "linux") return <LinuxLogoIcon size={size} weight="fill" />;
  return <DownloadSimpleIcon size={size} weight="bold" />;
}

// ── Motion helper ────────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Resolves the OS-appropriate installer URL, falling back to the releases page.
function useDownloadHref(assets: ReleaseAssets): string {
  const os = useOS();
  const url = os !== "unknown" ? assets[os] : null;
  return url ?? GITHUB_RELEASES;
}

// ── Primary download CTA ─────────────────────────────────────────────────────
function DownloadCTA({
  assets,
  className = "",
}: {
  assets: ReleaseAssets;
  className?: string;
}) {
  const os = useOS();
  const meta = os !== "unknown" ? OS_META[os] : null;
  const url = os !== "unknown" ? assets[os] : null;
  const href = url ?? GITHUB_RELEASES;
  const label = meta?.label ?? "Download for desktop";

  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-full bg-[#6b4af0] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_40px_-8px_rgba(107,74,240,0.7)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 ${className}`}
    >
      <OsGlyph os={os} size={18} />
      {label}
      <ArrowRight
        size={16}
        weight="bold"
        className="transition-transform duration-200 group-hover:translate-x-1"
      />
    </a>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "#stealth", label: "Stealth" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

function Navbar({ assets }: { assets: ReleaseAssets }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const os = useOS();
  const ddRef = useRef<HTMLDivElement>(null);

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

  const platforms: Exclude<OS, "unknown">[] = ["windows", "mac", "linux"];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-bg/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="container-x flex h-[68px] items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt="Intavue"
            width={150}
            height={70}
            className="rounded-lg brightness-0 grayscale invert"
            style={{ mixBlendMode: "screen" }}
          />
         
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

        {/* Desktop download dropdown */}
        <div ref={ddRef} className="relative hidden md:block">
          <button
            onClick={() => setDdOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-[#6b4af0] px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_6px_28px_-10px_rgba(107,74,240,0.8)] transition-transform hover:-translate-y-0.5"
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
            <div className="absolute top-[calc(100%+10px)] right-0 w-64 overflow-hidden rounded-2xl border border-line-strong bg-bg-elevated shadow-2xl shadow-black/60">
              {platforms.map((p, i) => {
                const url = assets[p];
                const here = p === os;
                return (
                  <a
                    key={p}
                    href={url ?? GITHUB_RELEASES}
                    onClick={() => setDdOpen(false)}
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

        <button
          className="text-ink md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <List size={26} />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[68px] bottom-0 z-40 flex flex-col gap-8 overflow-y-auto bg-bg px-6 py-8 md:hidden">
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
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            <p className="text-sm text-ink-soft">
              Free download for every platform.
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
    </header>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const STEALTH = [
  {
    icon: EyeSlash,
    title: "Hidden from capture",
    body: "Excluded from screen recording and screen-share at the OS level. Your interviewer sees their screen, never yours.",
  },
  {
    icon: CursorClick,
    title: "Click-through overlay",
    body: "Floats above any window and lets clicks pass straight through, so it never blocks what you are doing.",
  },
  {
    icon: Lightning,
    title: "Instant panic hide",
    body: "One keyboard shortcut clears it from view the moment you want a clean screen.",
  },
  {
    icon: ShieldCheck,
    title: "Yours alone",
    body: "Always-on-top, adjustable opacity, and a movable dock you place wherever you read best.",
  },
];

const FEATURES: {
  icon: PhosphorIcon;
  title: string;
  body: string;
  wide?: boolean;
}[] = [
  {
    icon: MicrophoneStage,
    title: "AI mock interviews",
    body: "Run realistic behavioral and technical mocks tuned to your exact role, then get scored feedback on structure, content, and delivery after every answer.",
    wide: true,
  },
  {
    icon: FileMagnifyingGlass,
    title: "Resume analyzer & builder",
    body: "ATS-score your resume, fix what is weak, then rebuild it from five clean templates and export to PDF.",
  },
  {
    icon: ChatTeardropText,
    title: "Cover letters & outreach",
    body: "Tailored cover letters and cold messages for any role in seconds, written to the job, never boilerplate.",
  },
  {
    icon: BookOpen,
    title: "Story bank",
    body: "Save your experiences, projects, and wins. Intavue draws on them so every answer is grounded in real, specific detail about you, not generic advice.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Install in two minutes",
    body: "Download for Windows, macOS, or Linux, create an account, and sign in. Fifty credits are waiting, no card required.",
  },
  {
    num: "02",
    title: "Set your target",
    body: "Drop in your resume and the role you are chasing. Every answer Intavue gives is shaped around your background and the job.",
  },
  {
    num: "03",
    title: "Practice, then perform",
    body: "Drill with mock interviews until you are sharp, then keep Intavue on your screen during the real thing, fully invisible to capture.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Everything you need to explore Intavue and run your first sessions.",
    cta: "Download",
    highlight: false,
    features: [
      "50 credits on signup, no card",
      "AI mock interviews",
      "Resume analysis",
      "Story bank for context-aware answers",
    ],
  },
  {
    name: "Pro",
    price: "$15",
    period: "per month",
    blurb: "For serious job seekers who want unlimited, consistent AI prep.",
    cta: "Get Pro",
    highlight: true,
    features: [
      "1,000 credits every cycle",
      "Unlimited mock interviews",
      "Resume analyzer + builder, 5 templates",
      "Cover letter & outreach writer",
      "Story bank for context-aware answers",
      "Invisible live interview copilot",
    ],
  },
  {
    name: "Top-up",
    price: "from $5",
    period: "one-time",
    blurb: "Need a boost without a subscription? Top-up packs never expire.",
    cta: "Buy credits",
    highlight: false,
    features: [
      "100 credits for $5",
      "500 credits for $10",
      "Credits never expire",
      "Stack on any plan",
      "Pay via Stripe or Paystack",
    ],
  },
];

const FAQ = [
  {
    q: "Is Intavue actually invisible during a screen share?",
    a: "Yes. On supported devices the window is excluded from the operating system's capture pipeline, so it does not appear in screen recordings or screen-share, while staying fully visible to you. Capture protection is available on Windows 10 version 2004 and newer, and on macOS. On Linux you still get the complete prep suite.",
  },
  {
    q: "Which apps does it stay hidden on?",
    a: "Because the protection works at the OS level, it covers the tools that capture your screen, including Zoom, Google Meet, Microsoft Teams, and Webex.",
  },
  {
    q: "What runs on which platform?",
    a: "The prep suite (mock interviews, resume tools, cover letters, and your story bank) runs on Windows, macOS, and Linux. The invisible live copilot needs OS-level capture protection, available on Windows 10 (2004+) and macOS.",
  },
  {
    q: "How do credits work?",
    a: "Actions that call AI cost credits. Free gives you 50 to start, Pro refills 1,000 every cycle, and top-up packs add credits that never expire and stack on any plan.",
  },
  {
    q: "Is my data private?",
    a: "Your resume, sessions, and notes are tied to your account and used to personalize your prep. Nothing about Intavue appears on a shared screen unless you choose to show it.",
  },
  {
    q: "How should I use the live copilot responsibly?",
    a: "Intavue is built to make you genuinely better prepared. Treat live assist as private notes and structure support, and always follow the rules of any assessment you take part in.",
  },
];

const SHARE_PLATFORMS = [
  { slug: "zoom", name: "Zoom" },
  { slug: "googlemeet", name: "Google Meet" },
  // { slug: "microsoftteams", name: "Microsoft Teams" },
  { slug: "webex", name: "Webex" },
];

const REQUIREMENTS: {
  os: Exclude<OS, "unknown">;
  name: string;
  specs: [string, string][];
  stealth: boolean;
}[] = [
  {
    os: "windows",
    name: "Windows",
    specs: [
      ["Version", "Windows 10 (2004+) or 11"],
      ["Architecture", "64-bit (x64)"],
      ["Memory", "4 GB RAM or more"],
      ["Disk", "300 MB free space"],
    ],
    stealth: true,
  },
  {
    os: "mac",
    name: "macOS",
    specs: [
      ["Version", "macOS 12 Monterey or later"],
      ["Chips", "Intel & Apple Silicon"],
      ["Memory", "4 GB RAM or more"],
      ["Disk", "300 MB free space"],
    ],
    stealth: true,
  },
  {
    os: "linux",
    name: "Linux",
    specs: [
      ["Format", "AppImage (x86_64)"],
      ["Distro", "Ubuntu 20.04+ or similar"],
      ["Memory", "4 GB RAM or more"],
      ["Disk", "300 MB free space"],
    ],
    stealth: false,
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [assets, setAssets] = useState<ReleaseAssets>({
    windows: null,
    mac: null,
    linux: null,
    version: null,
  });

  const downloadHref = useDownloadHref(assets);

  useEffect(() => {
    fetchReleaseAssets().then(setAssets);
  }, []);

  return (
    <div id="top" className="min-h-[100dvh] bg-bg text-ink">
      <Navbar assets={assets} />

      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="aura pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="grid-faint pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent_75%)]"
          aria-hidden
        />
        <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div className="rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-violet/[0.08] px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
              <Sparkle size={13} weight="fill" />
              AI interview copilot
            </span>

            <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance">
              Your interview copilot,
              <br />
              <span className="text-violet-bright">invisible</span> by design.
            </h1>

            <p className="mt-6 max-w-[34rem] text-[clamp(1rem,1.4vw,1.18rem)] leading-relaxed text-pretty text-ink-soft">
              Intavue stays hidden from screen share and feeds you answers,
              structure, and code the moment you need them.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <DownloadCTA assets={assets} />
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-white/[0.04]"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Brand mark visual (real asset, not a fake screenshot) */}
          <div className="relative mx-auto flex h-[320px] w-full max-w-[460px] items-center justify-center md:h-[440px]">
            <div className="breathe absolute h-[260px] w-[260px] rounded-full bg-violet/30 blur-[90px] md:h-[340px] md:w-[340px]" />
            <div className="absolute h-[300px] w-[300px] rounded-full border border-violet/15 md:h-[400px] md:w-[400px]" />
            <div className="absolute h-[220px] w-[220px] rounded-full border border-violet/10 md:h-[300px] md:w-[300px]" />
            <div className="floaty relative">
              <Image
                src="/icon.png"
                alt="Intavue listening, hidden from screen capture"
                width={500}
                height={310}
                priority
                className="relative brightness-0 drop-shadow-[0_20px_60px_rgba(124,92,255,0.45)] grayscale invert "
                style={{ mixBlendMode: "screen" }}
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line-strong bg-bg-elevated/90 px-4 py-2 backdrop-blur-md">
              <EyeSlash size={15} weight="bold" className="text-violet-bright" />
              <span className="text-[12.5px] font-medium text-ink">
                Not visible on the shared screen
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ COMPATIBILITY WALL ════════ */}
      <section className="border-y border-line bg-bg-elevated/40">
        <div className="container-x py-9">
          <p className="text-center font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
            Stays hidden during screen-share on
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {SHARE_PLATFORMS.map((p) => (
              <img
                key={p.slug}
                src={`https://cdn.simpleicons.org/${p.slug}/b3adc9`}
                alt={p.name}
                width={26}
                height={26}
                className="h-6 opacity-70 grayscale transition hover:opacity-100"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ STEALTH (the differentiator) ════════ */}
      <section id="stealth" className="relative py-24 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
              Built for the live moment
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.06] font-bold tracking-[-0.025em] text-balance">
              The help is right there.
              <br />
              The screen stays clean.
            </h2>
            <p className="mt-5 max-w-[32rem] text-[1.05rem] leading-relaxed text-pretty text-ink-soft">
              Most interview tools live in a separate tab anyone can see.
              Intavue runs as a true overlay that the operating system keeps out
              of every recording and share, so your prep travels with you into
              the interview itself.
            </p>
            <p className="mt-5 max-w-[32rem] text-sm leading-relaxed text-ink-faint">
              Capture protection is available on Windows 10 version 2004 and
              newer, and on macOS. Linux gets the full prep suite.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {STEALTH.map((s) => (
                <div
                  key={s.title}
                  className="surface rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-violet/25 bg-violet/10 text-violet-bright">
                    <s.icon size={21} weight="bold" />
                  </div>
                  <h3 className="font-display text-[1.05rem] font-semibold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════ FEATURE SUITE (bento) ════════ */}
      <section id="features" className="border-t border-line py-24 md:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
              Everything you need to walk in ready.
            </h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-pretty text-ink-soft">
              A focused set of tools that get you sharp before the interview and
              keep you steady during it, all powered by AI that knows your
              background.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 0.06}
                className={f.wide ? "sm:col-span-2 lg:col-span-3" : ""}
              >
                <div
                  className={`surface group h-full rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1 ${
                    f.wide ? "sm:p-9" : ""
                  }`}
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-violet/25 bg-violet/10 text-violet-bright transition-colors group-hover:bg-violet/20">
                    <f.icon size={23} weight="bold" />
                  </div>
                  <h3
                    className={`font-display font-semibold text-ink ${
                      f.wide ? "text-2xl" : "text-[1.15rem]"
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p
                    className={`mt-2.5 leading-relaxed text-ink-soft ${
                      f.wide ? "max-w-md text-[15px]" : "text-[13.5px]"
                    }`}
                  >
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section
        id="how"
        className="border-t border-line bg-bg-elevated/40 py-24 md:py-28"
      >
        <div className="container-x">
          <Reveal className="max-w-xl">
            <h2 className="font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
              From download to offer.
            </h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-pretty text-ink-soft">
              No setup labyrinth. You are practising within minutes and ready for
              the real thing the same day.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.08}>
                <div className="h-full bg-bg-elevated p-8 md:p-9">
                  <span className="font-mono text-5xl font-bold text-violet/30">
                    {s.num}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ PRICING ════════ */}
      <section id="pricing" className="border-t border-line py-24 md:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
              Pricing
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
              Start free. Upgrade when it pays for itself.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-start">
            {PLANS.map((plan) => (
              <Reveal key={plan.name}>
                <div
                  className={`relative h-full rounded-3xl p-8 ${
                    plan.highlight
                      ? "border border-violet/40 bg-violet/[0.06] shadow-[0_24px_80px_-32px_rgba(124,92,255,0.55)] lg:-mt-4 lg:pb-12"
                      : "surface"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute top-7 right-7 rounded-full bg-[#6b4af0] px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-white uppercase">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-extrabold tracking-tight text-ink">
                      {plan.price}
                    </span>
                    <span className="text-sm text-ink-faint">
                      {plan.period}
                    </span>
                  </div>
                  <p className="mt-3 min-h-[2.5rem] text-[13.5px] leading-relaxed text-ink-soft">
                    {plan.blurb}
                  </p>

                  {plan.highlight ? (
                    <a
                      href={downloadHref}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#6b4af0] px-6 py-3 text-[14px] font-semibold text-white transition-transform hover:-translate-y-0.5"
                    >
                      {plan.cta}
                      <ArrowRight size={15} weight="bold" />
                    </a>
                  ) : (
                    <a
                      href={downloadHref}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-line-strong px-6 py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-white/[0.04]"
                    >
                      {plan.cta}
                    </a>
                  )}

                  <ul className="mt-7 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check
                          size={16}
                          weight="bold"
                          className="mt-0.5 shrink-0 text-violet-bright"
                        />
                        <span className="text-[13.5px] leading-snug text-ink-soft">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section
        id="faq"
        className="border-t border-line bg-bg-elevated/40 py-24 md:py-28"
      >
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
              Questions, answered.
            </h2>
            <p className="mt-4 max-w-sm text-[1rem] leading-relaxed text-pretty text-ink-soft">
              Straight answers on how the invisibility works, what runs where,
              and how we think about responsible use.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-bg-elevated">
              {FAQ.map((item) => (
                <details key={item.q} className="group px-6 py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-semibold text-ink marker:hidden">
                    {item.q}
                    <CaretDown
                      size={17}
                      weight="bold"
                      className="shrink-0 text-ink-faint transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="pb-5 text-[14px] leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════ SYSTEM REQUIREMENTS ════════ */}
      <section id="requirements" className="border-t border-line py-24 md:py-28">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-[clamp(2rem,3.6vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.025em] text-balance">
              Light on your machine.
            </h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
              Intavue runs on the hardware you already have. Here is what each
              platform needs, including where the invisible live copilot is
              available.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 grid divide-y divide-line overflow-hidden rounded-3xl border border-line bg-bg-elevated md:grid-cols-3 md:divide-x md:divide-y-0">
              {REQUIREMENTS.map((r) => (
                <div key={r.os} className="flex flex-col p-8">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong text-ink">
                      <OsGlyph os={r.os} size={20} />
                    </span>
                    <span className="font-display text-xl font-semibold text-ink">
                      {r.name}
                    </span>
                  </div>

                  <dl className="mt-6 space-y-3.5">
                    {r.specs.map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <dt className="shrink-0 text-[12px] uppercase tracking-wide text-ink-faint">
                          {k}
                        </dt>
                        <dd className="text-right text-[13.5px] font-medium text-ink">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div
                    className={`mt-7 inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-[12px] font-medium ${
                      r.stealth
                        ? "border-violet/30 bg-violet/10 text-violet-bright"
                        : "border-line-strong text-ink-soft"
                    }`}
                  >
                    <EyeSlash size={14} weight="bold" />
                    {r.stealth
                      ? "Invisible copilot supported"
                      : "Prep suite only, no invisibility"}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <p className="mt-6 text-[13px] text-ink-faint">
            An internet connection and a free account are required for AI
            features. The app updates itself in the background.
          </p>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="relative overflow-hidden border-t border-line py-28">
        <div
          className="aura pointer-events-none absolute inset-x-0 top-auto bottom-0 h-[420px] rotate-180"
          aria-hidden
        />
        <Reveal className="container-x relative text-center">
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.04] font-extrabold tracking-[-0.03em] text-balance">
            Walk into your next interview with backup.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.1rem] leading-relaxed text-pretty text-ink-soft">
            Practice until you are sharp, then keep your copilot on screen and
            out of sight. Free to download, no card needed.
          </p>
          <div className="mt-9 flex justify-center">
            <DownloadCTA assets={assets} />
          </div>
          <p className="mt-5 font-mono text-[12px] text-ink-faint">
            {assets.version ? `${assets.version} · ` : ""}Free for Windows, macOS,
            and Linux
          </p>
        </Reveal>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-line">
        <div className="container-x flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/intavue_logo.png"
              alt="Intavue"
              width={26}
              height={26}
              className="rounded-md"
              style={{ mixBlendMode: "screen" }}
            />
            <span className="font-display text-base font-bold text-ink">
              Intavue
            </span>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[13.5px] text-ink-soft">
            <a href="#stealth" className="transition-colors hover:text-ink">
              Stealth
            </a>
            <a href="#features" className="transition-colors hover:text-ink">
              Features
            </a>
            <a href="#pricing" className="transition-colors hover:text-ink">
              Pricing
            </a>
            <a href="#faq" className="transition-colors hover:text-ink">
              FAQ
            </a>
            <a href="#requirements" className="transition-colors hover:text-ink">
              Requirements
            </a>
            <a href={GITHUB_RELEASES} className="transition-colors hover:text-ink">
              Download
            </a>
          </nav>
          <p className="font-mono text-[12px] text-ink-faint">
            © {new Date().getFullYear()} Intavue
          </p>
        </div>
      </footer>
    </div>
  );
}
