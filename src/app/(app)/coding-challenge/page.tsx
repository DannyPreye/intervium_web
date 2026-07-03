"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import type { Extension } from "@codemirror/state";
import { Code, CircleNotch, PaperPlaneTilt, CheckCircle, XCircle, ArrowClockwise } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { api } from "@/lib/api";
import AnswerFeedback, { type Feedback } from "@/components/app/Feedback";
import { cn } from "@/lib/utils";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

type Category = "arrays" | "strings" | "linked-lists" | "trees" | "graphs" | "dynamic-programming" | "sorting" | "binary-search" | "stacks-queues" | "recursion" | "hash-maps" | "greedy";
type Difficulty = "easy" | "medium" | "hard";
type Challenge = {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  language?: string;
  examples?: { input?: string; output?: string; explanation?: string }[];
  constraints?: string[];
  starterCode?: string;
};
type SubmitResult = { passed?: boolean; score?: number } & Feedback;

const CATEGORIES: Category[] = ["arrays", "strings", "hash-maps", "trees", "graphs", "dynamic-programming", "recursion", "sorting", "binary-search", "stacks-queues", "linked-lists", "greedy"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const idOf = (c: Challenge) => c.id || c._id || "";

function langExt(lang?: string): Extension {
  switch ((lang || "").toLowerCase()) {
    case "python": return python();
    case "java": return java();
    case "cpp":
    case "c++": return cpp();
    case "typescript": return javascript({ typescript: true });
    default: return javascript();
  }
}
const catLabel = (c: string) => c.replace(/-/g, " ");
const diffCls = (d: Difficulty) =>
  d === "easy" ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
  : d === "medium" ? "text-amber-300 border-amber-500/30 bg-amber-500/10"
  : "text-rose-300 border-rose-500/30 bg-rose-500/10";

export default function CodingChallengePage() {
  const [category, setCategory] = useState<Category>("arrays");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [generating, setGenerating] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const ext = useMemo(() => [langExt(challenge?.language)], [challenge?.language]);

  const generate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const c = (await api("/v1/coding-challenge/generate", {
        method: "POST",
        body: { category, difficulty },
      })) as Challenge;
      setChallenge(c);
      setCode(c.starterCode || "");
    } finally {
      setGenerating(false);
    }
  };

  const submit = async () => {
    if (!challenge || code.trim().length < 10) return;
    setSubmitting(true);
    try {
      const r = (await api(`/v1/coding-challenge/${idOf(challenge)}/submit`, {
        method: "POST",
        body: { userSolution: code },
      })) as SubmitResult | { feedback?: SubmitResult };
      setResult((r as { feedback?: SubmitResult }).feedback ?? (r as SubmitResult));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Coding Challenge" subtitle="Generate a problem, solve it in the editor, get an AI review." />

      {/* Config bar */}
      <Card className="mb-5 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label>Topic</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)}
                className="h-11 w-full rounded-xl border border-line-strong bg-bg px-3 text-[14px] capitalize text-ink outline-none focus:border-violet/60">
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{catLabel(c)}</option>)}
              </select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button key={d} type="button" onClick={() => setDifficulty(d)}
                    className={cn("rounded-full border px-3.5 py-2 text-[13px] font-medium capitalize transition-all", difficulty === d ? "border-violet/50 bg-violet/15 text-ink" : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink")}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button size="lg" onClick={generate} disabled={generating}>
            {generating ? (<><CircleNotch size={17} className="animate-spin" /> Generating…</>) : challenge ? (<><ArrowClockwise size={16} /> New problem</>) : (<><Code size={17} weight="bold" /> Generate</>)}
          </Button>
        </div>
      </Card>

      {!challenge ? (
        <Card className="grid min-h-[420px] place-items-center">
          <EmptyState icon={Code} title="No problem yet" description="Pick a topic and difficulty, then generate a coding problem to solve in the browser." />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          {/* Problem */}
          <Card className="p-6">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="font-display text-xl font-bold text-ink">{challenge.title}</h2>
              <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize", diffCls(challenge.difficulty))}>{challenge.difficulty}</span>
            </div>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink/90">{challenge.description}</p>

            {challenge.examples && challenge.examples.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-[12px] font-semibold tracking-wide text-ink-faint uppercase">Examples</p>
                {challenge.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-line bg-bg px-3 py-2.5 font-mono text-[12px] text-ink-soft">
                    {ex.input !== undefined && <p><span className="text-ink-faint">in:</span> {ex.input}</p>}
                    {ex.output !== undefined && <p><span className="text-ink-faint">out:</span> {ex.output}</p>}
                    {ex.explanation && <p className="mt-1 font-sans text-[12px] text-ink-faint">{ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}
            {challenge.constraints && challenge.constraints.length > 0 && (
              <div className="mt-5">
                <p className="mb-1.5 text-[12px] font-semibold tracking-wide text-ink-faint uppercase">Constraints</p>
                <ul className="space-y-1">
                  {challenge.constraints.map((c, i) => (
                    <li key={i} className="font-mono text-[12px] text-ink-soft">• {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Editor + result */}
          <div className="space-y-5 lg:sticky lg:top-8">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="font-mono text-[11px] text-ink-faint">{challenge.language || "javascript"}</span>
                <Button size="sm" onClick={submit} disabled={submitting || code.trim().length < 10}>
                  {submitting ? (<><CircleNotch size={14} className="animate-spin" /> Reviewing…</>) : (<><PaperPlaneTilt size={14} /> Submit</>)}
                </Button>
              </div>
              <div className="min-h-[360px]">
                <CodeMirror value={code} height="360px" theme="dark" extensions={ext} onChange={setCode} style={{ fontSize: 13 }} />
              </div>
            </Card>

            {result && (
              <Card className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  {result.passed ? (
                    <span className="flex items-center gap-1.5 text-[14px] font-semibold text-emerald-400"><CheckCircle size={17} weight="fill" /> Looks good</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[14px] font-semibold text-amber-400"><XCircle size={17} weight="fill" /> Needs work</span>
                  )}
                </div>
                <AnswerFeedback feedback={result} />
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
