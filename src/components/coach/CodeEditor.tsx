"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import type { Extension } from "@codemirror/state";
import { Play, PaperPlaneTilt, Terminal, CircleNotch, Sword, CheckCircle, XCircle, Trophy } from "@phosphor-icons/react";
import { api, unwrap } from "@/lib/api";

export type CodeLang = "javascript" | "python" | "java" | "cpp";

export type Challenge = {
  title: string;
  statement: string;
  samples?: { input: string; output: string; explanation?: string }[];
};
export type GradeResult = {
  passed: number;
  total: number;
  results: { index: number; passed: boolean; sample: boolean; input?: string; expected?: string; got?: string }[];
};

const LANGS: { value: CodeLang; label: string; ext: () => Extension }[] = [
  { value: "javascript", label: "JavaScript", ext: () => javascript() },
  { value: "python", label: "Python", ext: () => python() },
  { value: "java", label: "Java", ext: () => java() },
  { value: "cpp", label: "C++", ext: () => cpp() },
];

type RunResult = { stdout: string; stderr: string; output: string; compileError: string };

export default function CodeEditor({
  lang,
  code,
  onLang,
  onCode,
  onShare,
  challenge,
  grading,
  gradeResult,
  onSubmit,
}: {
  lang: CodeLang;
  code: string;
  onLang: (l: CodeLang) => void;
  onCode: (c: string) => void;
  onShare: (text: string) => void;
  challenge?: Challenge | null;
  grading?: boolean;
  gradeResult?: GradeResult | null;
  onSubmit?: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const active = LANGS.find((l) => l.value === lang) ?? LANGS[0];

  const run = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setResult(null);
    try {
      const r = unwrap<RunResult>(
        await api("/v1/code-execution/run", { method: "POST", body: { language: lang, source: code } })
      );
      setResult(r);
    } catch {
      setResult({ stdout: "", stderr: "Could not run your code — try again.", output: "", compileError: "" });
    } finally {
      setRunning(false);
    }
  };

  const share = () => {
    if (!code.trim()) return;
    const out = result ? result.compileError || result.stderr || result.stdout || result.output || "" : "";
    onShare(
      `Here's my ${active.label} code:\n\n\`\`\`${lang}\n${code}\n\`\`\`` +
        (out ? `\n\nWhen I run it I get:\n\`\`\`\n${out.slice(0, 1200)}\n\`\`\`` : "")
    );
  };

  const outputText = result
    ? result.compileError || result.stderr || result.stdout || result.output || "(no output)"
    : "";

  return (
    <div className="flex h-full flex-col">
      {challenge && (
        <div className="max-h-[40%] shrink-0 overflow-y-auto border-b border-line bg-violet/[0.05] px-4 py-3">
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-violet-bright uppercase">
            <Sword size={12} weight="fill" /> Challenge · {challenge.title}
          </p>
          <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-ink/90">{challenge.statement}</p>
          {challenge.samples && challenge.samples.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {challenge.samples.map((s, i) => (
                <p key={i} className="rounded-lg border border-line bg-bg px-2.5 py-1.5 font-mono text-[11px] text-ink-soft">
                  in: {JSON.stringify(s.input)} → out: {JSON.stringify(s.output)}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between px-3 py-2">
        <select
          value={lang}
          onChange={(e) => onLang(e.target.value as CodeLang)}
          className="rounded-md border border-line-strong bg-bg-raised px-2 py-1 text-[11px] font-medium text-ink outline-none"
        >
          {LANGS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-bg-raised px-3 py-1.5 text-[12px] font-semibold text-ink hover:border-violet/40 disabled:opacity-50"
          >
            {running ? <CircleNotch size={13} className="animate-spin" /> : <Play size={12} weight="fill" />} Run
          </button>
          {challenge ? (
            <button
              onClick={onSubmit}
              disabled={grading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--cta)] px-3 py-1.5 text-[12px] font-semibold text-white hover:brightness-110 disabled:opacity-50"
            >
              {grading ? <CircleNotch size={12} className="animate-spin" /> : <Sword size={12} weight="fill" />} Submit
            </button>
          ) : (
            <button
              onClick={share}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--cta)] px-3 py-1.5 text-[12px] font-semibold text-white hover:brightness-110"
            >
              <PaperPlaneTilt size={12} /> Share
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeMirror value={code} height="100%" theme="dark" extensions={[active.ext()]} onChange={onCode} style={{ height: "100%", fontSize: 13 }} />
      </div>

      {gradeResult ? (
        <div className="max-h-[40%] shrink-0 overflow-y-auto border-t border-line bg-bg/60 px-4 py-3">
          <p className={`mb-1.5 flex items-center gap-1.5 text-[12px] font-bold ${gradeResult.passed === gradeResult.total ? "text-emerald-400" : "text-amber-400"}`}>
            {gradeResult.passed === gradeResult.total ? <Trophy size={14} weight="fill" /> : <Terminal size={14} />}
            Passed {gradeResult.passed}/{gradeResult.total} tests
          </p>
          <div className="space-y-1">
            {gradeResult.results.map((r) => (
              <div key={r.index} className="flex items-start gap-1.5 text-[11px]">
                {r.passed ? <CheckCircle size={13} weight="fill" className="mt-0.5 shrink-0 text-emerald-400" /> : <XCircle size={13} weight="fill" className="mt-0.5 shrink-0 text-rose-400" />}
                <span className="text-ink-soft">
                  Test {r.index}
                  {r.sample && r.input !== undefined ? ` — in ${JSON.stringify(r.input)}, expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.got)}` : r.sample ? "" : " (hidden)"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (running || result) ? (
        <div className="max-h-[38%] shrink-0 overflow-y-auto border-t border-line bg-bg/60 px-4 py-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-ink-faint uppercase">
            <Terminal size={11} /> Output
          </p>
          {running ? (
            <p className="text-[12px] text-ink-soft">Running…</p>
          ) : (
            <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-ink/80">{outputText}</pre>
          )}
        </div>
      ) : null}
    </div>
  );
}
