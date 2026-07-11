"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CircleNotch,
  Trophy,
  TrendUp,
  TrendDown,
  Lightbulb,
  GraduationCap,
  Star,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { buttonVariants } from "@/components/ui/button";
import { api, unwrap } from "@/lib/api";
import { cn } from "@/lib/utils";

type Category = { score: number; feedback: string; examples?: string[] };
type Report = {
  overallScore: number;
  summary: string;
  technicalSkills?: Category;
  communicationSkills?: Category;
  problemSolving?: Category;
  behavioralCompetencies?: Category;
  strengths?: string[];
  areasForImprovement?: string[];
  recommendations?: string[];
  modelAnswers?: { question: string; strongAnswer: string }[];
  hiringRecommendation?: string;
};
type Session = { jobRole?: string; company?: string; durationMinutes?: number; report?: Report };

const RECO: Record<string, { label: string; cls: string }> = {
  strong_yes: { label: "Strong hire", cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  yes: { label: "Hire", cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  maybe: { label: "Maybe", cls: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  no: { label: "No hire", cls: "text-rose-300 border-rose-500/30 bg-rose-500/10" },
  strong_no: { label: "Strong no", cls: "text-rose-300 border-rose-500/30 bg-rose-500/10" },
};

const CATS: { key: keyof Report; label: string }[] = [
  { key: "technicalSkills", label: "Technical" },
  { key: "communicationSkills", label: "Communication" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "behavioralCompetencies", label: "Behavioral" },
];

const scoreColor = (v: number) => (v >= 8 ? "text-emerald-400" : v >= 6 ? "text-amber-400" : "text-rose-400");
const barColor = (v: number) => (v >= 8 ? "bg-emerald-500" : v >= 6 ? "bg-amber-500" : "bg-rose-500");

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = unwrap<Session>(await api(`/v1/live-interview/${sessionId}`));
        if (cancelled) return;
        setSession(s);
        if (s.report) {
          setReport(s.report);
        } else {
          const r = unwrap<Report>(await api(`/v1/live-interview/${sessionId}/report`, { method: "POST" }));
          if (!cancelled) setReport(r);
        }
      } catch {
        if (!cancelled) setError("We couldn't load this report. Please try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const reco = report?.hiringRecommendation ? RECO[report.hiringRecommendation] : null;

  return (
    <div className="mx-auto ">
      <Link href="/mock-interview" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> New interview
      </Link>

      {error ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-ink-soft">{error}</p>
        </Card>
      ) : !report ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-ink-soft">
            <CircleNotch size={18} className="animate-spin" />
            <span className="text-sm">Scoring your interview…</span>
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <Card className="flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">
                {session?.jobRole || "Interview"}
                {session?.company ? ` · ${session.company}` : ""}
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                {session?.durationMinutes ? `${session.durationMinutes} min · ` : ""}Performance report
              </p>
              {reco && (
                <span className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-semibold", reco.cls)}>
                  <Trophy size={13} weight="fill" /> {reco.label}
                </span>
              )}
            </div>
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-2 border-violet/30 bg-violet/5">
              <div className="text-center">
                <p className={cn("font-display text-3xl font-bold tabular-nums", scoreColor(report.overallScore))}>
                  {report.overallScore}
                </p>
                <p className="text-[10px] text-ink-faint">/ 10</p>
              </div>
            </div>
          </Card>

          {report.summary && (
            <Card className="p-6">
              <p className="text-[14.5px] leading-relaxed text-ink/90">{report.summary}</p>
            </Card>
          )}

          {/* Category scores */}
          <Card className="p-6">
            <h2 className="mb-4 text-[13px] font-semibold tracking-wide text-ink-faint uppercase">Scores</h2>
            <div className="space-y-3.5">
              {CATS.map(({ key, label }) => {
                const c = report[key] as Category | undefined;
                if (!c || typeof c.score !== "number") return null;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-[13px] text-ink/80">{label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-raised">
                      <div className={cn("h-full rounded-full", barColor(c.score))} style={{ width: `${(c.score / 10) * 100}%` }} />
                    </div>
                    <span className={cn("w-8 shrink-0 text-right text-[13px] font-bold tabular-nums", scoreColor(c.score))}>
                      {c.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Strengths + Areas */}
          <div className="grid gap-4 md:grid-cols-2">
            {!!report.strengths?.length && (
              <Card className="p-6">
                <h2 className="mb-3 flex items-center gap-1.5 text-[12px] font-bold tracking-widest text-emerald-400 uppercase">
                  <TrendUp size={14} weight="bold" /> Strengths
                </h2>
                <ul className="space-y-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13.5px] text-ink/90">
                      <Star size={14} weight="fill" className="mt-0.5 shrink-0 text-emerald-400" /> {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {!!report.areasForImprovement?.length && (
              <Card className="p-6">
                <h2 className="mb-3 flex items-center gap-1.5 text-[12px] font-bold tracking-widest text-amber-400 uppercase">
                  <TrendDown size={14} weight="bold" /> Areas to improve
                </h2>
                <ul className="space-y-2.5">
                  {report.areasForImprovement.map((a, i) => (
                    <li key={i} className="flex items-start justify-between gap-2 text-[13.5px] text-ink/90">
                      <span className="flex-1">{a}</span>
                      <Link
                        href="/concept-coach"
                        className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md border border-violet/30 bg-violet/10 px-2 py-0.5 text-[11px] font-semibold text-violet-bright hover:bg-violet/20"
                      >
                        <GraduationCap size={12} /> Learn
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {!!report.recommendations?.length && (
            <Card className="p-6">
              <h2 className="mb-3 flex items-center gap-1.5 text-[12px] font-bold tracking-widest text-violet-bright uppercase">
                <Lightbulb size={14} weight="fill" /> Recommendations
              </h2>
              <ul className="space-y-2">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-[13.5px] text-ink/90">
                    <span className="mt-0.5 shrink-0 text-violet-bright">•</span> {r}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {!!report.modelAnswers?.length && (
            <Card className="p-6">
              <h2 className="mb-3 text-[13px] font-semibold tracking-wide text-ink-faint uppercase">Model answers</h2>
              <div className="divide-y divide-line">
                {report.modelAnswers.map((m, i) => (
                  <details key={i} className="group py-3">
                    <summary className="cursor-pointer list-none text-[14px] font-medium text-ink marker:hidden">
                      {m.question}
                    </summary>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{m.strongAnswer}</p>
                  </details>
                ))}
              </div>
            </Card>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/mock-interview" className={cn(buttonVariants({ variant: "secondary" }))}>
              Practice again
            </Link>
            <Link href="/concept-coach" className={cn(buttonVariants())}>
              <GraduationCap size={17} /> Close gaps with a coach
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
