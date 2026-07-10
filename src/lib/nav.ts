import type { Icon } from "@phosphor-icons/react";
import {
  SquaresFour,
  MicrophoneStage,
  GraduationCap,
  Brain,
  CalendarBlank,
  Code,
  BookOpen,
  Briefcase,
  ChartLineUp,
  Buildings,
  FileMagnifyingGlass,
  ChatTeardropText,
  CreditCard,
  Lifebuoy,
  Gear,
} from "@phosphor-icons/react";

export type NavItem = { label: string; href: string; icon: Icon };
export type NavGroup = { title?: string; items: NavItem[] };

// Grouped app navigation. The first group is the mobile bottom-bar set.
export const NAV: NavGroup[] = [
  {
    items: [
      { label: "Home", href: "/dashboard", icon: SquaresFour },
      { label: "Mock Interview", href: "/mock-interview", icon: MicrophoneStage },
      { label: "Concept Coach", href: "/concept-coach", icon: GraduationCap },
    ],
  },
  {
    title: "Practice",
    items: [
      { label: "Interview Prep", href: "/interview-prep", icon: Brain },
      { label: "Daily Question", href: "/daily-question", icon: CalendarBlank },
      { label: "Coding Challenge", href: "/coding-challenge", icon: Code },
      { label: "Story Bank", href: "/story-bank", icon: BookOpen },
    ],
  },
  {
    title: "Job search",
    items: [
      { label: "Applications", href: "/applications", icon: Briefcase },
      { label: "Debrief", href: "/debrief", icon: ChartLineUp },
      { label: "Company Intel", href: "/company-intel", icon: Buildings },
    ],
  },
  {
    title: "Materials",
    items: [
      { label: "Resume Analyzer", href: "/resume", icon: FileMagnifyingGlass },
      { label: "Cover Letters", href: "/cover-letters", icon: ChatTeardropText },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Billing", href: "/billing", icon: CreditCard },
      { label: "Support", href: "/support", icon: Lifebuoy },
      { label: "Settings", href: "/settings", icon: Gear },
    ],
  },
];

// Bottom-bar items for mobile (max 4 + a "more" entry rendered by the shell).
export const MOBILE_PRIMARY: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: SquaresFour },
  { label: "Mock", href: "/mock-interview", icon: MicrophoneStage },
  { label: "Coach", href: "/concept-coach", icon: GraduationCap },
];
