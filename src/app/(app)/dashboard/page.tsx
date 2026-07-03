"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MicrophoneStage,
  GraduationCap,
  Brain,
  CalendarBlank,
  Code,
  BookOpen,
  FileMagnifyingGlass,
  ChatTeardropText,
  Buildings,
  Briefcase,
  ArrowRight,
  type Icon,
} from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { api, unwrap } from "@/lib/api";
import { cn } from "@/lib/utils";

type Me = { name?: string };

const TOOLS: { label: string; desc: string; href: string; icon: Icon }[] = [
  { label: "Interview Prep", desc: "Curated questions, scored feedback", href: "/interview-prep", icon: Brain },
  { label: "Daily Question", desc: "One sharp question a day", href: "/daily-question", icon: CalendarBlank },
  { label: "Coding Challenge", desc: "Practice problems, reviewed", href: "/coding-challenge", icon: Code },
  { label: "Story Bank", desc: "STAR stories the AI draws on", href: "/story-bank", icon: BookOpen },
  { label: "Resume Analyzer", desc: "ATS score and rebuild", href: "/resume", icon: FileMagnifyingGlass },
  { label: "Cover Letters", desc: "Tailored letters and outreach", href: "/cover-letters", icon: ChatTeardropText },
  { label: "Company Intel", desc: "Know the interview loop", href: "/company-intel", icon: Buildings },
  { label: "Applications", desc: "Track every role and stage", href: "/applications", icon: Briefcase },
];

export default function DashboardPage() {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    api<unknown>("/v1/user/me")
      .then((r) => setName(unwrap<Me>(r)?.name?.split(" ")[0] || ""))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-soft">{name ? `Welcome back, ${name}.` : "Welcome back."}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink">Your prep, in one place</h1>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-violet/25 bg-gradient-to-br from-violet/[0.16] via-violet/[0.05] to-transparent p-7 md:p-9">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-violet/25 blur-[90px]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <h2 className="font-display text-2xl font-bold text-ink md:text-[28px]">Walk in ready.</h2>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
              Rehearse a realistic voice interview, get a scored report, then close every gap with your
              AI coach.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/mock-interview" className={cn(buttonVariants({ size: "lg" }))}>
                <MicrophoneStage size={18} weight="fill" /> Start a mock interview
              </Link>
              <Link
                href="/concept-coach"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                <GraduationCap size={18} /> Learn with Sage
              </Link>
            </div>
          </div>
          <div className="hidden shrink-0 lg:block">
            <div className="grid h-28 w-28 place-items-center rounded-3xl bg-gradient-to-br from-violet to-violet-deep text-white shadow-2xl shadow-violet/30">
              <MicrophoneStage size={44} weight="fill" />
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section>
        <h3 className="mb-4 text-[13px] font-semibold tracking-wide text-ink-faint uppercase">Everything else</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="group flex items-start gap-4 rounded-2xl border border-line bg-bg-elevated p-5 transition-all hover:-translate-y-0.5 hover:border-violet/30"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-bg-raised text-violet-bright">
                  <Icon size={20} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center justify-between gap-2 text-[15px] font-semibold text-ink">
                    {t.label}
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-violet-bright"
                    />
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">{t.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
