import {
  EyeSlash,
  CursorClick,
  Lightning,
  ShieldCheck,
  MicrophoneStage,
  Code,
  FileMagnifyingGlass,
  ChatTeardropText,
  BookOpen,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { OS } from "./types";

// ── Release wiring (preserved from the original site) ───────────────────────
export const GITHUB_RELEASES =
  "https://github.com/DannyPreye/intervium-releases/releases/latest";
export const GITHUB_API_LATEST =
  "https://api.github.com/repos/DannyPreye/intervium-releases/releases/latest";

export const OS_META: Record<
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

// ── Data ─────────────────────────────────────────────────────────────────────
export const STEALTH = [
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

export const FEATURES: {
  icon: PhosphorIcon;
  title: string;
  body: string;
  wide?: boolean;
}[] = [
  {
    icon: MicrophoneStage,
    title: "Real-time voice mock interviews",
    body: "Talk through a live, hands-free interview with Alex — a senior AI hiring manager who speaks out loud, reads your resume, asks tailored follow-ups, coaches you after every answer, and hands you a full performance report at the end.",
    wide: true,
  },
  {
    icon: Code,
    title: "Live coding rounds",
    body: "Solve real problems in a built-in editor — JavaScript, Python, Java, or C++ — and run your code right there. Alex watches your approach and probes complexity, edge cases, and bugs, just like a real technical screen.",
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

export const STEPS = [
  {
    num: "01",
    title: "Install in two minutes",
    body: "Download for Windows or macOS, create an account, and sign in. Fifty credits are waiting, no card required.",
  },
  {
    num: "02",
    title: "Set your target",
    body: "Drop in your resume and the role you are chasing. Every answer Intavue gives is shaped around your background and the job.",
  },
  {
    num: "03",
    title: "Practice, then perform",
    body: "Rehearse out loud with voice mock interviews and live coding rounds until you are sharp, then keep Intavue on your screen during the real thing, fully invisible to capture.",
  },
];

export const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Everything you need to explore Intavue and run your first sessions.",
    cta: "Download",
    highlight: false,
    features: [
      "50 credits on signup, no card",
      "Resume analysis & cover letters",
      "Story bank for context-aware answers",
      "A short taste of the live interview",
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
      "Real-time voice mock interviews (~3 hrs/cycle)",
      "Live coding rounds — JS, Python, Java, C++",
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

// FAQ lives in its own icon-free module so server components (JSON-LD) can
// import it without pulling in client-only icon code. Re-exported here so
// existing `import { FAQ } from "@/lib/constants"` call sites keep working.
export { FAQ } from "./faq";

export const SHARE_PLATFORMS = [
  { slug: "zoom", name: "Zoom" },
  { slug: "googlemeet", name: "Google Meet" },
  // { slug: "microsoftteams", name: "Microsoft Teams" },
  { slug: "webex", name: "Webex" },
];

export const REQUIREMENTS: {
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
];
