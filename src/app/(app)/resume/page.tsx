"use client";

import { useCallback, useEffect, useState } from "react";
import { FileMagnifyingGlass, CircleNotch, Trash, CheckCircle, ArrowUpRight, Tag } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { TwoPane } from "@/components/app/Panels";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Skeleton, EmptyState } from "@/components/ui/misc";
import { api } from "@/lib/api";

type Analysis = {
  id?: string;
  _id?: string;
  jobRole?: string;
  company?: string;
  atsScore?: number;
  score?: number;
  matchScore?: number;
  summary?: string;
  overallFeedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  missingKeywords?: string[];
  keywords?: string[];
  suggestions?: string[];
  recommendations?: string[];
};
const idOf = (a: Analysis) => a.id || a._id || "";
const scoreOf = (a: Analysis) => a.atsScore ?? a.score ?? a.matchScore;
const asList = (...xs: (string[] | undefined)[]) => xs.find((x) => x && x.length) ?? [];

function scoreColor(s: number) {
  return s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-rose-400";
}

function ListBlock({ icon: Icon, color, title, items }: { icon: React.ElementType; color: string; title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className={`mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold tracking-wide uppercase ${color}`}>
        <Icon size={13} weight="bold" /> {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink/90">
            <span className="mt-0.5 shrink-0 opacity-50">•</span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);

  const load = useCallback(async () => {
    try {
      const r = (await api("/v1/resume-analyzer?limit=20")) as { results?: Analysis[] };
      setHistory(r.results ?? []);
    } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeText.trim().length < 50) return;
    setAnalyzing(true);
    try {
      const a = (await api("/v1/resume-analyzer/analyze", {
        method: "POST",
        body: {
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim() || undefined,
          jobRole: jobRole.trim() || undefined,
        },
      })) as Analysis;
      setResult(a);
      load();
    } finally {
      setAnalyzing(false);
    }
  };

  const remove = async (a: Analysis) => {
    setHistory((prev) => prev.filter((x) => idOf(x) !== idOf(a)));
    if (result && idOf(result) === idOf(a)) setResult(null);
    try { await api(`/v1/resume-analyzer/${idOf(a)}`, { method: "DELETE" }); } catch { load(); }
  };

  const input = (
    <Card className="p-6">
      <form onSubmit={analyze} className="space-y-4">
        <div>
          <Label htmlFor="rt">Resume text *</Label>
          <Textarea id="rt" className="min-h-44" value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume text here…" />
          <p className="mt-1 text-[11px] text-ink-faint">{resumeText.trim().length} chars (50 min)</p>
        </div>
        <div>
          <Label htmlFor="role">Target role</Label>
          <Input id="role" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="Senior Backend Engineer" />
        </div>
        <div>
          <Label htmlFor="jd">Job description</Label>
          <Textarea id="jd" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the posting to score against it…" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={analyzing || resumeText.trim().length < 50}>
          {analyzing ? (<><CircleNotch size={17} className="animate-spin" /> Analyzing…</>) : "Analyze (5 credits)"}
        </Button>
      </form>
    </Card>
  );

  return (
    <div>
      <PageHeader title="Resume Analyzer" subtitle="Score your resume against a role and see exactly what to fix." />
      <TwoPane aside={input} wide>
        {result ? (
          <Card className="p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-4 border-b border-line pb-6">
              {typeof scoreOf(result) === "number" && (
                <div className="flex items-baseline gap-1">
                  <span className={`font-display text-5xl font-bold ${scoreColor(scoreOf(result)!)}`}>{scoreOf(result)}</span>
                  <span className="text-lg text-ink-faint">/100</span>
                </div>
              )}
              <div>
                <p className="text-[13px] font-semibold text-ink">ATS match</p>
                {(result.summary || result.overallFeedback) && (
                  <p className="text-[13px] leading-relaxed text-ink-soft">{result.summary || result.overallFeedback}</p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <ListBlock icon={CheckCircle} color="text-emerald-400" title="Strengths" items={asList(result.strengths)} />
              <ListBlock icon={ArrowUpRight} color="text-amber-400" title="To improve" items={asList(result.weaknesses, result.improvements)} />
              <ListBlock icon={Tag} color="text-violet-bright" title="Missing keywords" items={asList(result.missingKeywords, result.keywords)} />
              <ListBlock icon={ArrowUpRight} color="text-ink-soft" title="Suggestions" items={asList(result.suggestions, result.recommendations)} />
            </div>
          </Card>
        ) : (
          <Card className="grid min-h-[360px] place-items-center">
            <EmptyState icon={FileMagnifyingGlass} title="Your analysis appears here" description="Paste your resume and a job description on the left, then analyze to get an ATS score and specific fixes." />
          </Card>
        )}

        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-[13px] font-semibold tracking-wide text-ink-faint uppercase">History</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {history.map((a) => (
                <Card key={idOf(a)} className="flex items-center justify-between gap-3 p-4">
                  <button onClick={() => setResult(a)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[13.5px] font-medium text-ink">{a.jobRole || "Resume analysis"}</p>
                    {typeof scoreOf(a) === "number" && <p className="text-[12px] text-ink-faint">ATS {scoreOf(a)}/100</p>}
                  </button>
                  <button onClick={() => remove(a)} aria-label="Delete" className="shrink-0 p-1.5 text-ink-faint hover:text-rose-400">
                    <Trash size={15} />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </TwoPane>
    </div>
  );
}
