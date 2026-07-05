"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import type { Extension } from "@codemirror/state";
import {
  Play, PaperPlaneTilt, Terminal, CircleNotch, ListChecks, Sparkle, CheckCircle, XCircle, Trophy, X,
} from "@phosphor-icons/react";
import { api, unwrap } from "@/lib/api";

type CodeLang = "javascript" | "python" | "java" | "cpp";
const LANGS: { value: CodeLang; label: string; ext: () => Extension; starter: string }[] = [
  { value: "javascript", label: "JavaScript", ext: () => javascript(), starter: "// Read stdin, print to stdout.\n" },
  { value: "python", label: "Python", ext: () => python(), starter: "# Read stdin, print to stdout.\nimport sys\n" },
  { value: "java", label: "Java", ext: () => java(), starter: "import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n\n  }\n}\n" },
  { value: "cpp", label: "C++", ext: () => cpp(), starter: "#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n\n  return 0;\n}\n" },
];

type RunResult = { stdout: string; stderr: string; output: string; compileError: string };
type Problem = { title: string; statement: string; inputFormat?: string; outputFormat?: string; samples: { input: string; output: string; explanation?: string }[]; testCount: number };
type TestRun = { passed: number; total: number; results: { index: number; passed: boolean; hidden: boolean; input?: string; expected?: string; got?: string }[] };

export default function CodePanel({
  sessionId,
  onShare,
  onClose,
}: {
  sessionId: string;
  onShare: (text: string) => void;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<CodeLang>("javascript");
  const [code, setCode] = useState(LANGS[0].starter);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [gettingProblem, setGettingProblem] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testRun, setTestRun] = useState<TestRun | null>(null);

  const active = LANGS.find((l) => l.value === lang) ?? LANGS[0];

  const switchLang = (next: CodeLang) => {
    if (LANGS.some((l) => l.starter === code)) setCode(LANGS.find((l) => l.value === next)!.starter);
    setLang(next);
    setRunResult(null);
  };

  const run = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setRunResult(null);
    try {
      const r = unwrap<RunResult>(await api("/v1/code-execution/run", { method: "POST", body: { language: lang, source: code } }));
      setRunResult(r);
    } catch {
      setRunResult({ stdout: "", stderr: "Run failed — try again.", output: "", compileError: "" });
    } finally {
      setRunning(false);
    }
  };

  const getProblem = async () => {
    setGettingProblem(true);
    setTestRun(null);
    try {
      const p = unwrap<Problem>(await api(`/v1/live-interview/${sessionId}/coding-problem`, { method: "POST", body: {} }));
      setProblem(p);
    } finally {
      setGettingProblem(false);
    }
  };

  const runTests = async () => {
    if (!code.trim()) return;
    setTesting(true);
    try {
      const t = unwrap<TestRun>(await api(`/v1/live-interview/${sessionId}/run-tests`, { method: "POST", body: { language: lang, source: code } }));
      setTestRun(t);
    } finally {
      setTesting(false);
    }
  };

  const share = () => {
    if (!code.trim()) return;
    const out = runResult ? runResult.compileError || runResult.stderr || runResult.stdout || runResult.output || "" : "";
    onShare(
      `Here is my current ${active.label} code:\n\n\`\`\`${lang}\n${code}\n\`\`\`` +
        (out ? `\n\nWhen I run it:\n\`\`\`\n${out.slice(0, 2000)}\n\`\`\`` : "") +
        `\n\nPlease take a look and continue the interview.`
    );
  };

  const outputText = runResult ? runResult.compileError || runResult.stderr || runResult.stdout || runResult.output || "(no output)" : "";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bg-elevated">
      <div className="flex shrink-0 items-center justify-between border-b border-line px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-ink">Coding</span>
          <select value={lang} onChange={(e) => switchLang(e.target.value as CodeLang)} className="rounded-md border border-line-strong bg-bg-raised px-2 py-1 text-[11px] font-medium text-ink outline-none">
            {LANGS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md border border-line-strong bg-bg-raised text-ink-faint hover:text-ink">
          <X size={13} />
        </button>
      </div>

      {/* Problem */}
      <div className="shrink-0 border-b border-line px-4 py-3">
        {problem ? (
          <div className="max-h-40 overflow-y-auto">
            <p className="mb-1 text-[13px] font-semibold text-ink">{problem.title}</p>
            <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-ink-soft">{problem.statement}</p>
            {problem.samples?.length > 0 && (
              <div className="mt-2 space-y-1">
                {problem.samples.map((s, i) => (
                  <p key={i} className="rounded-lg border border-line bg-bg px-2 py-1 font-mono text-[11px] text-ink-soft">
                    in: {JSON.stringify(s.input)} → out: {JSON.stringify(s.output)}
                  </p>
                ))}
              </div>
            )}
            <button onClick={getProblem} disabled={gettingProblem} className="mt-2 text-[11px] font-semibold text-violet-bright hover:underline disabled:opacity-50">
              {gettingProblem ? "…" : "New problem"}
            </button>
          </div>
        ) : (
          <button onClick={getProblem} disabled={gettingProblem} className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-bg-raised px-3 py-2 text-[12px] font-semibold text-ink hover:border-violet/40 disabled:opacity-50">
            {gettingProblem ? <CircleNotch size={14} className="animate-spin" /> : <Sparkle size={13} weight="fill" />} Get a coding problem
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeMirror value={code} height="100%" theme="dark" extensions={[active.ext()]} onChange={setCode} style={{ height: "100%", fontSize: 13 }} />
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line px-3 py-2">
        <button onClick={run} disabled={running} className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-bg-raised px-3 py-1.5 text-[12px] font-semibold text-ink hover:border-violet/40 disabled:opacity-50">
          {running ? <CircleNotch size={13} className="animate-spin" /> : <Play size={12} weight="fill" />} Run
        </button>
        {problem && (
          <button onClick={runTests} disabled={testing} className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-bg-raised px-3 py-1.5 text-[12px] font-semibold text-ink hover:border-violet/40 disabled:opacity-50">
            {testing ? <CircleNotch size={13} className="animate-spin" /> : <ListChecks size={13} />} Run tests
          </button>
        )}
        <button onClick={share} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[var(--cta)] px-3 py-1.5 text-[12px] font-semibold text-white hover:brightness-110">
          <PaperPlaneTilt size={12} /> Share with Alex
        </button>
      </div>

      {testRun ? (
        <div className="max-h-[34%] shrink-0 overflow-y-auto border-t border-line bg-bg/60 px-4 py-3">
          <p className={`mb-1.5 flex items-center gap-1.5 text-[12px] font-bold ${testRun.passed === testRun.total ? "text-emerald-400" : "text-amber-400"}`}>
            {testRun.passed === testRun.total ? <Trophy size={14} weight="fill" /> : <ListChecks size={14} />}
            Passed {testRun.passed}/{testRun.total} tests
          </p>
          <div className="space-y-1">
            {testRun.results.map((r) => (
              <div key={r.index} className="flex items-start gap-1.5 text-[11px]">
                {r.passed ? <CheckCircle size={13} weight="fill" className="mt-0.5 shrink-0 text-emerald-400" /> : <XCircle size={13} weight="fill" className="mt-0.5 shrink-0 text-rose-400" />}
                <span className="text-ink-soft">
                  Test {r.index}
                  {!r.hidden && r.input !== undefined ? ` — in ${JSON.stringify(r.input)}, expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.got)}` : r.hidden ? " (hidden)" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (running || runResult) ? (
        <div className="max-h-[34%] shrink-0 overflow-y-auto border-t border-line bg-bg/60 px-4 py-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-ink-faint uppercase">
            <Terminal size={11} /> Output
          </p>
          {running ? <p className="text-[12px] text-ink-soft">Running…</p> : <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-ink/80">{outputText}</pre>}
        </div>
      ) : null}
    </div>
  );
}
