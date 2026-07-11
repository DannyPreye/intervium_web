"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkle, CircleNotch, CheckCircle, Warning, ArrowRight, Lightning, Target, Key,
} from "@phosphor-icons/react";
import { API_BASE } from "@/lib/config";
import { track } from "@/lib/analytics";

type Score = {
  overallScore: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  topFix: string;
};

const ringColor = (s: number) => (s >= 80 ? "#34d399" : s >= 60 ? "#fbbf24" : "#fb7185");
const scoreText = (s: number) => (s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-rose-400");
const band = (s: number) => (s >= 80 ? "Strong" : s >= 60 ? "Decent — fixable" : "Needs work");

function ScoreRing({ score }: { score: number }) {
  const r = 58;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="relative grid h-[150px] w-[150px] place-items-center">
      <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
        <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
        <circle
          cx="75" cy="75" r={r} fill="none" stroke={ringColor(score)} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-display text-[42px] font-bold leading-none ${scoreText(score)}`}>{score}</span>
        <span className="mt-0.5 text-[11px] font-medium text-ink-faint">/ 100</span>
      </div>
    </div>
  );
}

export default function ResumeScoreClient() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Score | null>(null);

  const run = async () => {
    if (resume.trim().length < 100 || busy) {
      if (resume.trim().length < 100) setError("Please paste your full resume (at least 100 characters).");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/v1/public/resume-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resume.trim(), jobDescription: jd.trim() || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data as { message?: string })?.message || "Couldn't score your resume. Please try again.");
      }
      setResult(data as Score);
      track("Free Resume Scored", { score: (data as Score)?.overallScore, withJd: !!jd.trim() });
      // Reveal the result.
      setTimeout(() => document.getElementById("score-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Input card */}
      <div className="surface rounded-3xl p-6 sm:p-8">
        <label className="mb-2 block text-[13px] font-semibold text-ink">Paste your resume</label>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={9}
          placeholder="Paste your full resume text here — copy it straight from your PDF or doc…"
          className="w-full resize-y rounded-2xl border border-line-strong bg-bg px-4 py-3 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-violet/50"
        />
        <label className="mt-5 mb-2 block text-[13px] font-semibold text-ink">
          Target job description <span className="font-normal text-ink-faint">· optional, sharpens the score</span>
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={4}
          placeholder="Paste the job posting you're targeting for a keyword-matched score…"
          className="w-full resize-y rounded-2xl border border-line-strong bg-bg px-4 py-3 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-ink-faint focus:border-violet/50"
        />

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-300">
            <Warning size={15} weight="fill" className="mt-0.5 shrink-0" /> {error}
          </p>
        )}

        <button
          onClick={run}
          disabled={busy}
          className="mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[var(--cta)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_40px_-8px_rgba(107,74,240,0.7)] transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? <><CircleNotch size={18} className="animate-spin" /> Scoring your resume…</> : <><Sparkle size={17} weight="fill" /> Score my resume</>}
        </button>
        <p className="mt-3 text-center text-[12px] text-ink-faint">Free · No account · ~20 seconds</p>
      </div>

      {/* Result */}
      {result && (
        <div id="score-result" className="mt-8 space-y-5">
          <div className="surface flex flex-col items-center gap-5 rounded-3xl p-6 text-center sm:flex-row sm:text-left sm:p-8">
            <ScoreRing score={result.overallScore} />
            <div>
              <p className={`text-[12px] font-bold tracking-widest uppercase ${scoreText(result.overallScore)}`}>{band(result.overallScore)}</p>
              <p className="mt-1.5 font-display text-[19px] leading-snug font-semibold text-ink">{result.verdict}</p>
            </div>
          </div>

          {result.topFix && (
            <div className="flex items-start gap-3 rounded-2xl border border-violet/25 bg-violet/[0.07] p-5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet/15 text-violet-bright"><Lightning size={17} weight="fill" /></span>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-violet-bright uppercase">Highest-impact fix</p>
                <p className="mt-1 text-[14px] leading-relaxed text-ink">{result.topFix}</p>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="surface rounded-2xl p-6">
              <p className="mb-3 flex items-center gap-2 text-[12px] font-bold tracking-widest text-emerald-400 uppercase"><CheckCircle size={15} weight="fill" /> Strengths</p>
              <ul className="space-y-2.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/70" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface rounded-2xl p-6">
              <p className="mb-3 flex items-center gap-2 text-[12px] font-bold tracking-widest text-amber-400 uppercase"><Target size={15} weight="fill" /> Fix these</p>
              <ul className="space-y-2.5">
                {result.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {result.missingKeywords.length > 0 && (
            <div className="surface rounded-2xl p-6">
              <p className="mb-3 flex items-center gap-2 text-[12px] font-bold tracking-widest text-ink-faint uppercase"><Key size={15} weight="fill" /> Missing keywords</p>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((k) => (
                  <span key={k} className="rounded-full border border-line-strong bg-bg-raised px-3 py-1.5 text-[12.5px] font-medium text-ink-soft">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Conversion CTA */}
          <div className="relative overflow-hidden rounded-3xl border border-violet/30 bg-gradient-to-br from-violet/[0.18] via-violet/[0.05] to-transparent p-7 text-center sm:p-9">
            <h3 className="font-display text-[22px] leading-tight font-bold text-ink">Fix all of this automatically.</h3>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
              Create a free account to rebuild a tailored, ATS-ready résumé, get the full section-by-section breakdown, and export a clean PDF — plus voice mock interviews to practice.
            </p>
            <Link
              href="/register"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--cta)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_40px_-8px_rgba(107,74,240,0.7)] transition-all hover:brightness-110"
            >
              Create my free account <ArrowRight size={16} weight="bold" />
            </Link>
            <p className="mt-3 text-[12px] text-ink-faint">Free to start · No card required</p>
          </div>
        </div>
      )}
    </div>
  );
}
