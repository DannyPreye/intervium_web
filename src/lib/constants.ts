import {
  MicrophoneStage,
  Code,
  GraduationCap,
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
    icon: GraduationCap,
    title: "Concept Coach — your AI tutor",
    body: "Stuck on a concept? Learn it out loud with Sage, a patient voice tutor who draws diagrams on a live whiteboard, writes code alongside you, quizzes you as you go, and sets auto-graded challenges. It remembers how you learn and pulls topics straight from your interview weak spots.",
    wide: true,
  },
  {
    icon: FileMagnifyingGlass,
    title: "Resume analyzer & builder",
    body: "ATS-score your resume, fix what is weak, then rebuild it from seven clean templates and export to PDF.",
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
    title: "Practice until you're sharp",
    body: "Rehearse out loud with voice mock interviews and live coding rounds, review your scored report, and close every weak spot with the Concept Coach before the real thing.",
  },
];

export const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "Everything you need to explore Intavue and run your first sessions.",
    cta: "Start free",
    highlight: false,
    features: [
      "50 credits on signup, no card",
      "Resume analysis & cover letters",
      "Story bank for context-aware answers",
      "A short taste of live mock interviews",
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
      "Concept Coach — AI tutor with diagrams & challenges",
      "Resume analyzer + builder, 7 templates",
      "Cover letter & outreach writer",
      "Story bank for context-aware answers",
      "Application tracker, debrief & analytics",
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

export const REQUIREMENTS: {
  os: Exclude<OS, "unknown">;
  name: string;
  specs: [string, string][];
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
  },
];
