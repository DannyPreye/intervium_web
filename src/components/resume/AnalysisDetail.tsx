"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Lightbulb, TrendUp, Warning, CheckCircle, Briefcase, CaretDown, CaretUp,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import {
  type ResumeAnalysis, scoreColor, scoreStroke, normScore, normImportance,
} from "./types";

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" stroke={scoreStroke(score)} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (score / 100) * c }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className={`font-display text-4xl font-bold ${scoreColor(score)}`}>{score}</div>
          <div className="text-[10px] font-semibold tracking-widest text-ink-faint uppercase">/ 100</div>
        </div>
      </div>
    </div>
  );
}

function KeywordChip({ keyword, found, tone }: { keyword: string; found: boolean; tone: "critical" | "important" | "nice" }) {
  const cls = !found
    ? tone === "critical"
      ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-300"
    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${tone === "nice" && !found ? "border-line-strong bg-bg-raised text-ink-faint" : cls}`}>
      {keyword} {tone !== "nice" && (found ? "✓" : "✗")}
    </span>
  );
}

export default function AnalysisDetail({ analysis, onBack }: { analysis: ResumeAnalysis; onBack: () => void }) {
  const [showJd, setShowJd] = useState(false);
  const score = analysis.atsScore ?? 0;
  const kw = analysis.keywords ?? [];
  const critical = kw.filter((k) => normImportance(k.importance) === "critical");
  const important = kw.filter((k) => normImportance(k.importance) === "important");
  const nice = kw.filter((k) => ["nicetohave", "nicetohavebonus", "bonus"].includes(normImportance(k.importance)));
  const sections = analysis.sectionScores ?? [];
  const rewrites = analysis.rewriteSuggestions ?? [];

  const verdict =
    score >= 80 ? "Excellent match — high probability of passing ATS."
      : score >= 60 ? "Good start, but missing key terminology. Review the weaknesses."
        : "Low match. Significant tailoring is required for this role.";

  return (
    <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.28 }} className="pb-10">
      <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-[12px] font-semibold text-violet-bright transition-colors hover:text-violet">
        <ArrowLeft size={14} weight="bold" /> Back to analyses
      </button>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">{analysis.company || "Resume Analysis"}</h2>
          {analysis.jobRole && <p className="mt-1 text-[15px] text-ink-soft">{analysis.jobRole}</p>}
        </div>
      </div>

      {analysis.jobDescription && (
        <div className="mb-8">
          <button onClick={() => setShowJd((v) => !v)} className="flex items-center gap-2 text-[13px] font-medium text-violet-bright hover:text-violet">
            <Briefcase size={15} /> {showJd ? "Hide job description" : "View job description"}
            {showJd ? <CaretUp size={13} /> : <CaretDown size={13} />}
          </button>
          <AnimatePresence>
            {showJd && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <Card className="mt-3 max-h-96 overflow-y-auto p-5">
                  <pre className="font-sans text-[13px] leading-relaxed whitespace-pre-wrap text-ink-soft">{analysis.jobDescription}</pre>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {analysis.summary && (
        <Card className="mb-6 border-violet/20 bg-violet/[0.06] p-6">
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-widest text-violet-bright uppercase">
            <Lightbulb size={14} weight="fill" /> AI summary
          </p>
          <p className="text-[13.5px] leading-relaxed text-ink-soft">{analysis.summary}</p>
        </Card>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-12">
        <Card className="flex flex-col items-center justify-center p-8 lg:col-span-4">
          <ScoreRing score={score} />
          <p className="mt-5 max-w-[220px] text-center text-[13px] leading-relaxed text-ink-soft">{verdict}</p>
        </Card>

        <Card className="p-6 lg:col-span-8">
          <p className="mb-6 flex items-center gap-2 text-[11px] font-bold tracking-widest text-ink-faint uppercase">
            <TrendUp size={14} weight="bold" className="text-violet-bright" /> Component breakdown
          </p>
          {sections.length > 0 ? (
            <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
              {sections.map((s, i) => {
                const val = normScore(s.score ?? 0);
                return (
                  <div key={i} className="rounded-xl border border-line bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[13px] font-medium text-ink-soft">{s.section || `Section ${i + 1}`}</span>
                      <span className={`text-[13px] font-bold ${scoreColor(val)}`}>{val}%</span>
                    </div>
                    <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${val >= 80 ? "bg-emerald-500" : val >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                      />
                    </div>
                    {s.feedback && <p className="text-[12px] leading-relaxed text-ink-faint">{s.feedback}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-ink-faint italic">No section breakdown available.</p>
          )}
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        {/* Keywords */}
        <Card className="border-t-[3px] border-t-violet/50 p-6">
          <p className="mb-5 flex items-center gap-2 text-[11px] font-bold tracking-widest text-ink-faint uppercase">
            <CheckCircle size={14} weight="bold" className="text-emerald-400" /> Keyword density
          </p>
          {kw.length > 0 ? (
            <div className="space-y-5">
              {critical.length > 0 && (
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-ink">Critical requirements</p>
                    <p className="text-[11px] font-medium text-emerald-400">{critical.filter((k) => k.found).length}/{critical.length} found</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {critical.map((k, i) => <KeywordChip key={i} keyword={k.keyword} found={k.found} tone="critical" />)}
                  </div>
                </div>
              )}
              {important.length > 0 && (
                <div className="border-t border-line pt-4">
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-[13px] font-medium text-ink-soft">Important terminology</p>
                    <p className="text-[11px] font-medium text-amber-400">{important.filter((k) => k.found).length}/{important.length} found</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {important.map((k, i) => <KeywordChip key={i} keyword={k.keyword} found={k.found} tone="important" />)}
                  </div>
                </div>
              )}
              {nice.length > 0 && (
                <div className="border-t border-line pt-4">
                  <p className="mb-2.5 text-[13px] text-ink-soft">Bonus / nice to have</p>
                  <div className="flex flex-wrap gap-2">
                    {nice.map((k, i) => <KeywordChip key={i} keyword={k.keyword} found={k.found} tone="nice" />)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-ink-faint italic">No keyword intelligence found.</p>
          )}
        </Card>

        {/* Strengths */}
        <Card className="border-t-[3px] border-t-emerald-500/50 p-6">
          <p className="mb-5 flex items-center gap-2 text-[11px] font-bold tracking-widest text-ink-faint uppercase">
            <TrendUp size={14} weight="bold" className="text-emerald-400" /> Key strengths
          </p>
          {analysis.strengths && analysis.strengths.length > 0 ? (
            <ul className="space-y-3.5">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-emerald-500/25 bg-emerald-500/10">
                    <CheckCircle size={12} weight="fill" className="text-emerald-400" />
                  </span>
                  <p className="text-[13px] leading-relaxed text-ink-soft">{s}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-[13px] text-ink-faint">No major strengths identified.</p>
          )}
        </Card>

        {/* Weaknesses */}
        <Card className="border-t-[3px] border-t-rose-500/50 p-6">
          <p className="mb-5 flex items-center gap-2 text-[11px] font-bold tracking-widest text-ink-faint uppercase">
            <Warning size={14} weight="bold" className="text-rose-400" /> Weaknesses to fix
          </p>
          {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
            <ul className="space-y-3.5">
              {analysis.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-rose-500/25 bg-rose-500/10">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  </span>
                  <p className="text-[13px] leading-relaxed text-ink-soft">{w}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle size={36} className="text-emerald-500/25" />
              <p className="text-[13px] font-medium text-emerald-400">No major weaknesses identified!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Rewrite suggestions */}
      {rewrites.length > 0 && (
        <Card className="relative overflow-hidden p-6">
          <p className="mb-6 flex items-center gap-2 text-[11px] font-bold tracking-widest text-ink-faint uppercase">
            <Lightbulb size={14} weight="fill" className="text-amber-400" /> Bullet point rewriter
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {rewrites.map((s, i) => (
              <div key={i} className="rounded-xl border border-line bg-white/[0.02] p-5">
                {s.section && <p className="mb-3 text-[10px] font-bold tracking-wide text-violet-bright uppercase">{s.section}</p>}
                {s.original && (
                  <div className="mb-3">
                    <p className="mb-1 text-[10px] font-semibold text-rose-400/80 uppercase">Original</p>
                    <p className="text-[13px] italic line-through opacity-70">&ldquo;{s.original}&rdquo;</p>
                  </div>
                )}
                <div className="mb-3">
                  <p className="mb-1 text-[10px] font-semibold text-emerald-400 uppercase">Optimized</p>
                  <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/[0.06] p-3">
                    <p className="text-[13px] font-medium text-emerald-100/90">&ldquo;{s.improved || s.suggested}&rdquo;</p>
                  </div>
                </div>
                {s.reason && (
                  <div className="border-t border-line pt-3">
                    <p className="mb-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">Why</p>
                    <p className="text-[12px] leading-relaxed text-ink-faint">{s.reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
