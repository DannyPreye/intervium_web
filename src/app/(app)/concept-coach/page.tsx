"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Presentation,
  Code as CodeIcon,
  SpeakerHigh,
  SpeakerX,
  Stop,
  CircleNotch,
  Sparkle,
  Play,
  X,
  CheckCircle,
  XCircle,
  Warning,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api, unwrap } from "@/lib/api";
import { useRealtimeTutor, type ToolCall } from "@/lib/useRealtimeTutor";
import CanvasBoard, { type Shape } from "@/components/coach/CanvasBoard";
import MermaidDiagram from "@/components/coach/MermaidDiagram";
import type { CodeLang } from "@/components/coach/CodeEditor";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(() => import("@/components/coach/CodeEditor"), { ssr: false });

const STARTERS = ["Recursion", "Big-O & time complexity", "Hash maps", "Pointers & references", "Async / promises", "Binary search"];
const LANGS: { value: CodeLang; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];
const STARTER_CODE: Record<CodeLang, string> = {
  javascript: '// Try it out — write code and run it.\nconsole.log("hello")\n',
  python: '# Try it out — write code and run it.\nprint("hello")\n',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("hello");\n  }\n}\n',
  cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){ cout << "hello" << endl; return 0; }\n',
};
const STEER = [
  { label: "Simpler", text: "Can you explain that more simply?" },
  { label: "Example", text: "Can you show me a concrete example?" },
  { label: "Why?", text: "Why is that? Walk me through the reasoning." },
  { label: "Draw it", text: "Can you draw that on the whiteboard?" },
  { label: "Quiz me", text: "Quiz me on what we've covered so far." },
];

type Quiz = { question: string; options: string[]; answerIndex?: number; explanation?: string; chosen?: number };

function ConceptCoachInner() {
  const params = useSearchParams();
  const [phase, setPhase] = useState<"setup" | "active" | "ending">("setup");
  const [topic, setTopic] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [language, setLanguage] = useState<CodeLang>("javascript");
  const [muted, setMuted] = useState(false);
  const [suggested, setSuggested] = useState<string[]>([]);

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"board" | "code">("board");
  const [editorLang, setEditorLang] = useState<CodeLang>("javascript");
  const [editorCode, setEditorCode] = useState(STARTER_CODE.javascript);
  const [illustration, setIllustration] = useState<{ title?: string; shapes: Shape[] } | null>(null);
  const [diagram, setDiagram] = useState<{ mermaid: string; title?: string } | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const captionsEnd = useRef<HTMLDivElement>(null);
  const languageLabel = LANGS.find((l) => l.value === language)?.label ?? "JavaScript";

  const handleToolCall = useCallback((call: ToolCall) => {
    if (call.name === "draw_diagram" && call.args?.mermaid) {
      setDiagram({ mermaid: String(call.args.mermaid), title: call.args.title });
      setPanelTab("board");
      setPanelOpen(true);
    } else if (call.name === "draw_illustration" && Array.isArray(call.args?.shapes)) {
      setIllustration({ title: call.args.title, shapes: call.args.shapes as Shape[] });
      setPanelTab("board");
      setPanelOpen(true);
    } else if (call.name === "write_code" && typeof call.args?.code === "string") {
      const l = call.args.language;
      if (l && LANGS.some((x) => x.value === l)) setEditorLang(l as CodeLang);
      setEditorCode(call.args.code);
      setPanelTab("code");
      setPanelOpen(true);
    } else if (call.name === "ask_quiz" && Array.isArray(call.args?.options)) {
      setQuiz({ question: call.args.question, options: call.args.options, answerIndex: call.args.answerIndex, explanation: call.args.explanation });
    }
  }, []);

  const tutor = useRealtimeTutor({
    enabled: phase === "active",
    topic: activeTopic,
    language: languageLabel,
    muted,
    onToolCall: handleToolCall,
  });

  useEffect(() => {
    api("/v1/concept-coach/suggestions")
      .then((r) => {
        const d = unwrap<{ fromInterviews?: string[]; reviewTopics?: string[] }>(r);
        setSuggested([...(d.reviewTopics ?? []), ...(d.fromInterviews ?? [])]);
      })
      .catch(() => {});
  }, []);

  // Prefill topic from a "Learn" link (mock report).
  useEffect(() => {
    const t = params.get("topic");
    if (t) setTopic(t);
  }, [params]);

  useEffect(() => {
    captionsEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [tutor.turns, tutor.currentMessage]);

  const start = (t?: string) => {
    const chosen = (t ?? topic).trim();
    if (!chosen) return;
    setActiveTopic(chosen);
    setEditorLang(language);
    setEditorCode(STARTER_CODE[language]);
    setIllustration(null);
    setDiagram(null);
    setQuiz(null);
    setPanelOpen(false);
    setPhase("active");
  };

  const end = async () => {
    setPhase("ending");
    const transcript = tutor.turns.map((x) => `${x.role === "tutor" ? "Sage" : "You"}: ${x.content}`).join("\n");
    try {
      await api("/v1/concept-coach/session-end", { method: "POST", body: { topic: activeTopic, transcript } });
    } catch {}
    setPhase("setup");
    setActiveTopic("");
    setTopic("");
    setPanelOpen(false);
  };

  const answerQuiz = (i: number) => {
    if (!quiz || quiz.chosen !== undefined) return;
    setQuiz({ ...quiz, chosen: i });
    tutor.sendText(`For your quiz I picked: "${quiz.options[i]}"`);
  };

  const togglePanel = (tab: "board" | "code") => {
    if (panelOpen && panelTab === tab) setPanelOpen(false);
    else {
      setPanelTab(tab);
      setPanelOpen(true);
    }
  };

  /* ── Setup ─────────────────────────────────────────────── */
  if (phase === "setup") {
    const chips = [...suggested, ...STARTERS].filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 10);
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet to-violet-deep text-white shadow-lg shadow-violet/30">
            <GraduationCap size={26} weight="fill" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Learn with Sage</h1>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">
            A patient voice tutor who teaches any concept out loud, draws on a live whiteboard, writes code, and quizzes you.
          </p>
        </div>

        <Card className="space-y-5 p-6">
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink-soft">What do you want to learn?</p>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && start()} placeholder="e.g. how recursion works" />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-soft">Preferred language</p>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all",
                    language === l.value ? "border-violet/50 bg-violet/15 text-ink" : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink"
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[13px] font-medium text-ink-soft">Suggested for you</p>
            <div className="flex flex-wrap gap-2">
              {chips.map((s) => (
                <button key={s} onClick={() => start(s)} className="rounded-full border border-line-strong bg-bg-raised px-3.5 py-1.5 text-[13px] text-ink-soft transition-all hover:border-violet/40 hover:text-ink">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Button size="lg" className="w-full" disabled={!topic.trim()} onClick={() => start()}>
            <Play size={17} weight="fill" /> Start session
          </Button>
          <p className="text-center text-[11px] text-ink-faint">Live voice tutoring uses ~5 credits per minute.</p>
        </Card>
      </div>
    );
  }

  if (phase === "ending") {
    return (
      <div className="grid min-h-[50vh] place-items-center text-center">
        <div>
          <CircleNotch size={32} className="mx-auto animate-spin text-violet-bright" />
          <p className="mt-3 text-sm text-ink-soft">Saving your progress…</p>
        </div>
      </div>
    );
  }

  /* ── Active ────────────────────────────────────────────── */
  const connecting = tutor.status === "connecting";
  const connected = tutor.status === "connected";
  const thinking = connecting || (connected && !tutor.currentMessage && !tutor.isSpeaking);

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      {/* Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-rose-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Live
          </span>
          <span className="truncate text-[13px] font-semibold text-ink">{activeTopic}</span>
          <span className="hidden rounded-full border border-line-strong bg-bg-raised px-2 py-0.5 text-[10px] text-ink-soft sm:inline">{languageLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => togglePanel("board")} title="Whiteboard" className={cn("grid h-9 w-9 place-items-center rounded-lg border transition-all", panelOpen && panelTab === "board" ? "border-violet/40 bg-violet/10 text-violet-bright" : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink")}>
            <Presentation size={16} />
          </button>
          <button onClick={() => togglePanel("code")} title="Editor" className={cn("grid h-9 w-9 place-items-center rounded-lg border transition-all", panelOpen && panelTab === "code" ? "border-violet/40 bg-violet/10 text-violet-bright" : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink")}>
            <CodeIcon size={16} />
          </button>
          <button onClick={() => setMuted((m) => !m)} title={muted ? "Unmute" : "Mute"} className={cn("grid h-9 w-9 place-items-center rounded-lg border transition-all", muted ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink")}>
            {muted ? <SpeakerX size={16} /> : <SpeakerHigh size={16} />}
          </button>
          <Button variant="danger" size="sm" onClick={end}>
            <Stop size={14} weight="fill" /> End
          </Button>
        </div>
      </div>

      {tutor.errorMsg && (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-[13px] text-amber-300">
          <Warning size={15} weight="fill" className="shrink-0" /> {tutor.errorMsg}
        </p>
      )}

      <div className="mt-4 flex flex-1 flex-col gap-4 lg:flex-row">
        {/* Conversation */}
        <div className="flex-1 space-y-4">
          <Card className="relative overflow-hidden p-6">
            {(tutor.isSpeaking || thinking) && <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-violet/20 blur-[80px]" />}
            <div className="relative mb-3 flex items-center gap-3">
              <div className={cn("grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-violet to-violet-deep text-white shadow-lg shadow-violet/30", tutor.isSpeaking && "ring-2 ring-violet-bright/60")}>
                <GraduationCap size={19} weight="fill" />
              </div>
              <div>
                <p className="font-display text-[15px] font-bold text-ink">Sage</p>
                <p className="text-[12px] text-ink-soft">{tutor.isSpeaking ? "Speaking…" : thinking ? "Thinking…" : "Listening"}</p>
              </div>
            </div>
            <div className="relative min-h-[52px]">
              {!tutor.currentMessage && thinking ? (
                <p className="flex items-center gap-2.5 text-sm text-ink-soft"><CircleNotch size={15} className="animate-spin" /> Getting ready…</p>
              ) : (
                <p className="text-[16px] font-medium leading-relaxed text-ink">{tutor.currentMessage}</p>
              )}
            </div>
          </Card>

          {/* Steering chips */}
          <div className="flex flex-wrap gap-2">
            {STEER.map((s) => (
              <button key={s.label} onClick={() => tutor.sendText(s.text)} disabled={!connected} className="rounded-full border border-line-strong bg-bg-raised px-3 py-1.5 text-[12px] text-ink-soft transition-all hover:border-violet/40 hover:text-ink disabled:opacity-40">
                {s.label}
              </button>
            ))}
          </div>

          {/* Quiz */}
          {quiz && (
            <Card className="p-5">
              <p className="mb-3 text-[14px] font-semibold text-ink">{quiz.question}</p>
              <div className="space-y-2">
                {quiz.options.map((o, i) => {
                  const answered = quiz.chosen !== undefined;
                  const correct = quiz.answerIndex === i;
                  const chosen = quiz.chosen === i;
                  return (
                    <button
                      key={i}
                      onClick={() => answerQuiz(i)}
                      disabled={answered}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl border px-4 py-2.5 text-left text-[13px] font-medium text-ink transition-all",
                        !answered ? "border-line-strong bg-bg-raised hover:border-violet/40"
                          : correct ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : chosen ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                          : "border-line-strong bg-bg-raised opacity-60"
                      )}
                    >
                      {quiz.chosen !== undefined && correct && <CheckCircle size={15} weight="fill" className="shrink-0" />}
                      {quiz.chosen !== undefined && chosen && !correct && <XCircle size={15} weight="fill" className="shrink-0" />}
                      {o}
                    </button>
                  );
                })}
              </div>
              {quiz.chosen !== undefined && quiz.explanation && <p className="mt-3 text-[12px] text-ink-soft">{quiz.explanation}</p>}
            </Card>
          )}
          <div ref={captionsEnd} />
        </div>

        {/* Panel */}
        {panelOpen && (
          <div className="flex h-[60vh] flex-col overflow-hidden rounded-2xl border border-line bg-bg-elevated lg:h-auto lg:w-[46%]">
            <div className="flex shrink-0 items-center justify-between border-b border-line px-3 py-2">
              <div className="flex gap-1">
                {(["board", "code"] as const).map((tab) => (
                  <button key={tab} onClick={() => setPanelTab(tab)} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition-all", panelTab === tab ? "bg-violet/10 text-violet-bright" : "text-ink-soft hover:text-ink")}>
                    {tab === "board" ? <Presentation size={13} /> : <CodeIcon size={13} />}
                    {tab === "board" ? "Whiteboard" : "Editor"}
                  </button>
                ))}
              </div>
              <button onClick={() => setPanelOpen(false)} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md border border-line-strong bg-bg-raised text-ink-faint hover:text-ink">
                <X size={13} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {panelTab === "board" ? (
                <div className="h-full space-y-4 overflow-y-auto p-4">
                  {!illustration && !diagram ? (
                    <div className="grid h-full place-items-center px-8 text-center">
                      <div>
                        <Presentation size={26} className="mx-auto text-ink-faint" />
                        <p className="mt-2 text-[13px] text-ink-soft">Sage&rsquo;s whiteboard</p>
                        <p className="mt-1 text-[11px] text-ink-faint">Diagrams and sketches appear here as she teaches.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {illustration && (
                        <div className="space-y-2">
                          {illustration.title && <p className="text-[11px] font-semibold text-ink-soft">{illustration.title}</p>}
                          <CanvasBoard shapes={illustration.shapes} />
                        </div>
                      )}
                      {diagram && (
                        <div className="space-y-2">
                          {diagram.title && <p className="text-[11px] font-semibold text-ink-soft">{diagram.title}</p>}
                          <MermaidDiagram code={diagram.mermaid} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <CodeEditor lang={editorLang} code={editorCode} onLang={setEditorLang} onCode={setEditorCode} onShare={(t) => tutor.sendText(t)} />
              )}
            </div>
          </div>
        )}
      </div>

      <p className="flex items-center justify-center gap-1.5 py-3 text-center text-[11px] text-ink-faint">
        <Sparkle size={11} weight="fill" /> Talk to Sage, open the whiteboard or editor, and use the chips to steer her.
      </p>
    </div>
  );
}

export default function ConceptCoachPage() {
  return (
    <Suspense fallback={null}>
      <ConceptCoachInner />
    </Suspense>
  );
}
