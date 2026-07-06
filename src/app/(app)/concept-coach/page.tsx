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
  Sword,
  Warning,
  Trophy,
  ChartBar,
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
type FullChallenge = {
  title: string;
  statement: string;
  language: string;
  starterCode: string;
  samples?: { input: string; output: string; explanation?: string }[];
  tests: { input: string; expectedOutput: string; sample?: boolean }[];
};
type GradeResult = {
  passed: number;
  total: number;
  results: { index: number; passed: boolean; sample: boolean; input?: string; expected?: string; got?: string }[];
};
type TopicMastery = { name: string; mastery: number; notes?: string };

const masteryWord = (m: number) =>
  m >= 5 ? "Mastered" : m >= 4 ? "Strong" : m >= 3 ? "Comfortable" : m >= 2 ? "Shaky" : m >= 1 ? "Beginner" : "New";

function MasteryBars({ topics }: { topics: TopicMastery[] }) {
  return (
    <div className="space-y-2.5">
      {topics.map((t) => (
        <div key={t.name}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[12px] font-medium text-ink">{t.name}</span>
            <span className="text-[10px] text-ink-faint">{masteryWord(t.mastery)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-raised">
            <div className="h-full rounded-full bg-violet transition-all" style={{ width: `${(Math.max(0, Math.min(5, t.mastery)) / 5) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConceptCoachInner() {
  const params = useSearchParams();
  const [phase, setPhase] = useState<"setup" | "active" | "ending" | "recap">("setup");
  const [topic, setTopic] = useState("");
  const [profileTopics, setProfileTopics] = useState<TopicMastery[]>([]);
  const [recap, setRecap] = useState<{ name: string; before: number; after: number }[]>([]);
  const startTopicsRef = useRef<TopicMastery[]>([]);
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
  const [challenge, setChallenge] = useState<FullChallenge | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

  const captionsEnd = useRef<HTMLDivElement>(null);
  const sendTextRef = useRef<(t: string) => void>(() => {});
  const editorLangRef = useRef<CodeLang>("javascript");
  const editorCodeRef = useRef(STARTER_CODE.javascript);
  const activeTopicRef = useRef("");
  const languageLabel = LANGS.find((l) => l.value === language)?.label ?? "JavaScript";
  editorLangRef.current = editorLang;
  editorCodeRef.current = editorCode;
  activeTopicRef.current = activeTopic;

  const startChallenge = useCallback(async (focus?: string) => {
    try {
      const c = unwrap<FullChallenge>(
        await api("/v1/concept-coach/challenge", {
          method: "POST",
          body: { topic: focus || activeTopicRef.current, language: editorLangRef.current },
        })
      );
      if (!c?.tests?.length) return;
      setChallenge(c);
      setGradeResult(null);
      if (LANGS.some((x) => x.value === c.language)) setEditorLang(c.language as CodeLang);
      setEditorCode(c.starterCode || STARTER_CODE[(c.language as CodeLang) ?? "javascript"] || "");
      setPanelTab("code");
      setPanelOpen(true);
      sendTextRef.current(
        `I've put a coding challenge titled "${c.title}" in the learner's editor: ${c.statement} Briefly introduce it and offer help if they get stuck.`
      );
    } catch {
      /* ignore */
    }
  }, []);

  const handleToolCall = useCallback(
    (call: ToolCall) => {
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
        setChallenge(null);
        setGradeResult(null);
        setPanelTab("code");
        setPanelOpen(true);
      } else if (call.name === "ask_quiz" && Array.isArray(call.args?.options)) {
        setQuiz({ question: call.args.question, options: call.args.options, answerIndex: call.args.answerIndex, explanation: call.args.explanation });
      } else if (call.name === "start_challenge") {
        startChallenge(call.args?.focus);
      }
    },
    [startChallenge]
  );

  const tutor = useRealtimeTutor({
    enabled: phase === "active",
    topic: activeTopic,
    language: languageLabel,
    muted,
    onToolCall: handleToolCall,
  });
  sendTextRef.current = tutor.sendText;

  const submitChallenge = async () => {
    if (!challenge) return;
    setGrading(true);
    try {
      const g = unwrap<GradeResult>(
        await api("/v1/concept-coach/challenge/grade", {
          method: "POST",
          body: { language: editorLangRef.current, source: editorCodeRef.current, tests: challenge.tests },
        })
      );
      setGradeResult(g);
      tutor.sendText(
        `I submitted my solution to "${challenge.title}" — it passed ${g.passed} of ${g.total} tests.` +
          (g.passed === g.total ? " All passed! Congratulate me briefly." : " Some failed — help me spot why.")
      );
    } finally {
      setGrading(false);
    }
  };

  useEffect(() => {
    api("/v1/concept-coach/suggestions")
      .then((r) => {
        const d = unwrap<{ fromInterviews?: string[]; reviewTopics?: string[] }>(r);
        setSuggested([...(d.reviewTopics ?? []), ...(d.fromInterviews ?? [])]);
      })
      .catch(() => {});
  }, []);

  const loadProfile = useCallback(() => {
    api("/v1/concept-coach/profile")
      .then((r) => setProfileTopics(unwrap<{ topics?: TopicMastery[] }>(r).topics ?? []))
      .catch(() => {});
  }, []);
  useEffect(() => { loadProfile(); }, [loadProfile]);

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
    startTopicsRef.current = profileTopics; // snapshot for the end-of-session diff
    setActiveTopic(chosen);
    setEditorLang(language);
    setEditorCode(STARTER_CODE[language]);
    setIllustration(null);
    setDiagram(null);
    setQuiz(null);
    setChallenge(null);
    setGradeResult(null);
    setPanelOpen(false);
    setPhase("active");
  };

  const end = async () => {
    setPhase("ending");
    const transcript = tutor.turns.map((x) => `${x.role === "tutor" ? "Sage" : "You"}: ${x.content}`).join("\n");
    let afterTopics: TopicMastery[] = startTopicsRef.current;
    try {
      const r = unwrap<{ topics?: TopicMastery[] }>(
        await api("/v1/concept-coach/session-end", { method: "POST", body: { topic: activeTopic, transcript } })
      );
      afterTopics = r.topics ?? afterTopics;
    } catch {
      /* non-blocking */
    }

    // Build a recap of what changed this session.
    const before = new Map(startTopicsRef.current.map((t) => [t.name.toLowerCase(), t.mastery]));
    const changes = afterTopics
      .map((t) => ({ name: t.name, before: before.get(t.name.toLowerCase()) ?? 0, after: t.mastery }))
      .filter((c) => c.after !== c.before || !before.has(c.name.toLowerCase()))
      .sort((a, b) => b.after - b.before - (a.after - a.before));

    setProfileTopics(afterTopics);
    setActiveTopic("");
    setPanelOpen(false);
    if (changes.length > 0) {
      setRecap(changes);
      setPhase("recap");
    } else {
      setTopic("");
      setPhase("setup");
    }
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

  /* ── Recap ─────────────────────────────────────────────── */
  if (phase === "recap") {
    return (
      <div className="mx-auto max-w-lg py-12">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-violet/10 text-violet-bright">
            <Trophy size={26} weight="fill" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Session recap</h1>
          <p className="mt-1 text-sm text-ink-soft">Here&rsquo;s how your mastery moved.</p>
        </div>
        <Card className="space-y-4 p-6">
          {recap.map((c) => {
            const delta = c.after - c.before;
            return (
              <div key={c.name}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink">{c.name}</span>
                  <span className={cn("text-[11px] font-bold", delta > 0 ? "text-emerald-400" : "text-ink-soft")}>
                    {masteryWord(c.before)} → {masteryWord(c.after)}{delta > 0 ? ` (+${delta})` : ""}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-raised">
                  <div className="h-full rounded-full bg-violet transition-all" style={{ width: `${(Math.max(0, Math.min(5, c.after)) / 5) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </Card>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => { setTopic(""); setPhase("setup"); }}>Done</Button>
          <Button onClick={() => { const again = recap[0]?.name || topic; setTopic(again); start(again); }}>
            <Play size={15} weight="fill" /> Keep learning
          </Button>
        </div>
      </div>
    );
  }

  /* ── Setup ─────────────────────────────────────────────── */
  if (phase === "setup") {
    const chips = [...suggested, ...STARTERS].filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 10);
    const topMastery = [...profileTopics].sort((a, b) => b.mastery - a.mastery).slice(0, 5);
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

        {topMastery.length > 0 && (
          <Card className="mt-4 p-6">
            <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-ink-faint uppercase">
              <ChartBar size={13} weight="bold" className="text-violet-bright" /> Your mastery
            </p>
            <MasteryBars topics={topMastery} />
          </Card>
        )}
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
            <button
              onClick={() => startChallenge()}
              disabled={!connected}
              className="inline-flex items-center gap-1.5 rounded-full border border-violet/30 bg-violet/10 px-3 py-1.5 text-[12px] font-semibold text-violet-bright transition-all hover:bg-violet/20 disabled:opacity-40"
            >
              <Sword size={12} weight="fill" /> Challenge me
            </button>
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
                <CodeEditor
                  lang={editorLang}
                  code={editorCode}
                  onLang={setEditorLang}
                  onCode={setEditorCode}
                  onShare={(t) => tutor.sendText(t)}
                  challenge={challenge ? { title: challenge.title, statement: challenge.statement, samples: challenge.samples } : null}
                  grading={grading}
                  gradeResult={gradeResult}
                  onSubmit={submitChallenge}
                />
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
