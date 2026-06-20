import {
  EyeSlash,
  CursorClick,
  Lightning,
  ShieldCheck,
  MicrophoneStage,
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
    body: "Drill with mock interviews until you are sharp, then keep Intavue on your screen during the real thing, fully invisible to capture.",
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

export const FAQ = [
  {
    q: "Is Intavue actually invisible during a screen share?",
    a: "Yes. On supported devices the window is excluded from the operating system's capture pipeline, so it does not appear in screen recordings or screen-share, while staying fully visible to you. Capture protection is available on Windows 10 version 2004 and newer, and on macOS.",
  },
  {
    q: "Which apps does it stay hidden on?",
    a: "Because the protection works at the OS level, it covers the tools that capture your screen, including Zoom, Google Meet, Microsoft Teams, and Webex.",
  },
  {
    q: "What runs on which platform?",
    a: "Intavue runs on Windows and macOS. The full prep suite (mock interviews, resume tools, cover letters, and your story bank) works on both, and the invisible live copilot needs OS-level capture protection, available on Windows 10 (2004+) and macOS.",
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
