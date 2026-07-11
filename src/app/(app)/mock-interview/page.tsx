"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MicrophoneStage,
  SpeakerHigh,
  SpeakerX,
  Stop,
  CircleNotch,
  Warning,
  Code as CodeIcon,
  Chalkboard,
} from "@phosphor-icons/react";

const CodePanel = dynamic(() => import("@/components/interview/CodePanel"), { ssr: false });
const WhiteboardPanel = dynamic(() => import("@/components/interview/WhiteboardPanel"), { ssr: false });
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api, unwrap, ApiError } from "@/lib/api";
import { useRealtimeInterview } from "@/lib/useRealtimeInterview";
import { cn } from "@/lib/utils";
import PersonaPicker from "@/components/app/PersonaPicker";
import { INTERVIEWERS, interviewerName } from "@/lib/personas";

type Phase = "setup" | "active" | "ending";
type Seniority = "intern" | "junior" | "mid" | "senior" | "staff";
type InterviewType = "general" | "technical" | "behavioral" | "mixed";

const SENIORITY: { value: Seniority; label: string }[] = [
  { value: "intern", label: "Intern" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
  { value: "staff", label: "Staff+" },
];
const TYPES: { value: InterviewType; label: string; desc: string }[] = [
  { value: "mixed", label: "Mixed", desc: "Behavioral + technical" },
  { value: "behavioral", label: "Behavioral", desc: "STAR stories, fit" },
  { value: "technical", label: "Technical", desc: "Role skills, system design" },
  { value: "general", label: "General", desc: "Broad screen" },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Pill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-[13px] font-medium transition-all",
        selected
          ? "border-violet/50 bg-violet/15 text-ink"
          : "border-line-strong bg-bg-raised text-ink-soft hover:border-violet/30 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function MockInterviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>("setup");
  const [sessionId, setSessionId] = useState("");
  const [muted, setMuted] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [starting, setStarting] = useState(false);
  const [setupError, setSetupError] = useState("");

  const [jobRole, setJobRole] = useState("");
  const [company, setCompany] = useState("");
  const [seniority, setSeniority] = useState<Seniority>("mid");
  const [interviewType, setInterviewType] = useState<InterviewType>("mixed");
  const [focusNotes, setFocusNotes] = useState("");
  const [interviewerId, setInterviewerId] = useState(INTERVIEWERS[0].id);
  const ivName = interviewerName(interviewerId);

  const captionsEnd = useRef<HTMLDivElement>(null);

  // Prefill from a Company Intel "tailored mock" link (?company=&role=&focus=).
  useEffect(() => {
    const c = params.get("company");
    const r = params.get("role");
    const f = params.get("focus");
    if (c) setCompany(c);
    if (r) setJobRole(r);
    if (f) setFocusNotes(f);
  }, [params]);

  const interview = useRealtimeInterview({ enabled: phase === "active", sessionId, muted });

  useEffect(() => {
    if (phase !== "active") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    captionsEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview.turns, interview.currentQuestion]);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole.trim()) return;
    setSetupError("");
    setStarting(true);
    try {
      const s = unwrap<{ id?: string; _id?: string }>(
        await api("/v1/live-interview", {
          method: "POST",
          body: {
            jobRole: jobRole.trim(),
            company: company.trim() || undefined,
            seniority,
            interviewType,
            focusNotes: focusNotes.trim() || undefined,
            interviewerId,
          },
        })
      );
      const id = s.id || s._id;
      if (!id) throw new Error("Could not create the session.");
      setSessionId(id);
      setElapsed(0);
      setPhase("active");
    } catch (err) {
      setSetupError(err instanceof ApiError ? err.message : "Could not start the interview.");
    } finally {
      setStarting(false);
    }
  };

  const end = async () => {
    setPhase("ending");
    try {
      await api(`/v1/live-interview/${sessionId}/end`, { method: "PATCH" });
      await api(`/v1/live-interview/${sessionId}/report`, { method: "POST" });
    } catch {
      /* the report page will retry generation */
    }
    router.push(`/mock-interview/${sessionId}/report`);
  };

  /* ── Setup ─────────────────────────────────────────────── */
  if (phase === "setup") {
    return (
      <div className="mx-auto ">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Mock Interview</h1>
          <p className="mt-1 text-sm text-ink-soft">
            A real-time voice interview with {ivName}. Talk out loud; you&rsquo;ll get a scored report at the end.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={start} className="space-y-5">
            {setupError && (
              <p className="flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-300">
                <Warning size={15} weight="fill" className="shrink-0" /> {setupError}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="role">Target role *</Label>
                <Input id="role" required value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="Senior Backend Engineer" />
              </div>
              <div>
                <Label htmlFor="company">Company (optional)</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Stripe" />
              </div>
            </div>

            <div>
              <Label>Choose your interviewer</Label>
              <PersonaPicker personas={INTERVIEWERS} value={interviewerId} onChange={setInterviewerId} />
            </div>

            <div>
              <Label>Seniority</Label>
              <div className="flex flex-wrap gap-2">
                {SENIORITY.map((s) => (
                  <Pill key={s.value} selected={seniority === s.value} onClick={() => setSeniority(s.value)}>
                    {s.label}
                  </Pill>
                ))}
              </div>
            </div>

            <div>
              <Label>Interview type</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setInterviewType(t.value)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      interviewType === t.value
                        ? "border-violet/50 bg-violet/10"
                        : "border-line-strong bg-bg-raised hover:border-violet/30"
                    )}
                  >
                    <p className="text-[13px] font-semibold text-ink">{t.label}</p>
                    <p className="mt-0.5 text-[11px] text-ink-faint">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="focus">Anything to focus on? (optional)</Label>
              <Textarea
                id="focus"
                value={focusNotes}
                onChange={(e) => setFocusNotes(e.target.value)}
                placeholder="Go deep on system design; I'm switching from backend to ML; push me on trade-offs…"
              />
            </div>

            <div className="flex justify-end ">
              <Button type="submit" size="lg" className="w-fit" disabled={starting || !jobRole.trim()}>
                {starting ? "Setting up…" : "Start interview"}
              </Button>
            </div>
            <p className="text-center text-[11px] text-ink-faint">
              Uses your microphone. Live voice costs ~5 credits per minute.
            </p>
          </form>
        </Card>
      </div>
    );
  }

  /* ── Ending ────────────────────────────────────────────── */
  if (phase === "ending") {
    return (
      <div className="grid min-h-[60vh] place-items-center text-center">
        <div>
          <CircleNotch size={34} className="mx-auto animate-spin text-violet-bright" />
          <p className="mt-3 text-sm text-ink-soft">Scoring your interview…</p>
        </div>
      </div>
    );
  }

  /* ── Active ────────────────────────────────────────────── */
  const connecting = interview.status === "connecting";
  const connected = interview.status === "connected";
  const thinking = connecting || (connected && !interview.currentQuestion && !interview.isAlexSpeaking);
  const panelOpen = codeOpen || whiteboardOpen;

  return (
    <div className={cn("mx-auto flex min-h-[calc(100dvh-8rem)] flex-col", panelOpen ? "w-full" : "")}>
      {/* Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-rose-400 uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
            Live
          </span>
          <span className="font-mono text-[13px] tabular-nums text-ink-soft">{fmt(elapsed)}</span>
          {!connected && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
              Connecting…
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCodeOpen((o) => { const n = !o; if (n) setWhiteboardOpen(false); return n; })}
            title="Coding round"
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all",
              codeOpen
                ? "border-violet/40 bg-violet/10 text-violet-bright"
                : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink"
            )}
          >
            <CodeIcon size={15} /> Code
          </button>
          <button
            onClick={() => setWhiteboardOpen((o) => { const n = !o; if (n) setCodeOpen(false); return n; })}
            title="System-design whiteboard"
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all",
              whiteboardOpen
                ? "border-violet/40 bg-violet/10 text-violet-bright"
                : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink"
            )}
          >
            <Chalkboard size={15} /> Whiteboard
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg border transition-all",
              muted
                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink"
            )}
          >
            {muted ? <SpeakerX size={16} /> : <SpeakerHigh size={16} />}
          </button>
          <Button variant="danger" size="sm" onClick={end}>
            <Stop size={14} weight="fill" /> End
          </Button>
        </div>
      </div>

      {interview.errorMsg && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-[13px] text-amber-300">
          <Warning size={15} weight="fill" className="shrink-0" /> {interview.errorMsg}
        </p>
      )}

      {/* Alex + coding round / whiteboard */}
      <div className={cn("mt-6 flex min-h-0 flex-1 flex-col gap-4", panelOpen && "lg:flex-row")}>
        <div className={cn("space-y-5", panelOpen ? "min-w-0 flex-1 lg:overflow-y-auto lg:pr-1" : "flex-1")}>
          <Card className="relative overflow-hidden p-7">
            {(interview.isAlexSpeaking || thinking) && (
              <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-violet/20 blur-[80px]" />
            )}
            <div className="relative mb-4 flex items-center gap-3">
              <div
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-violet to-violet-deep text-white shadow-lg shadow-violet/30",
                  interview.isAlexSpeaking && "ring-2 ring-violet-bright/60"
                )}
              >
                <MicrophoneStage size={20} weight="fill" />
              </div>
              <div>
                <p className="font-display text-[15px] font-bold text-ink">{ivName}</p>
                <p className="text-[12px] text-ink-soft">
                  {interview.isAlexSpeaking ? "Speaking…" : thinking ? "Thinking…" : "Listening"}
                </p>
              </div>
            </div>
            <div className="relative min-h-[56px]">
              {!interview.currentQuestion && thinking ? (
                <p className="flex items-center gap-2.5 text-sm text-ink-soft">
                  <CircleNotch size={15} className="animate-spin" /> Getting ready…
                </p>
              ) : (
                <p className="text-[17px] font-medium leading-relaxed text-ink">{interview.currentQuestion}</p>
              )}
            </div>
          </Card>

          {interview.turns.length > 0 && (
            <div className="space-y-2.5">
              {interview.turns.map((t, i) => (
                <div key={i} className={cn("flex", t.role === "candidate" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl border px-4 py-2.5",
                      t.role === "candidate"
                        ? "border-violet/20 bg-violet/10"
                        : "border-line bg-bg-elevated"
                    )}
                  >
                    <p className="mb-0.5 text-[9px] font-bold tracking-widest text-ink-faint uppercase">
                      {t.role === "candidate" ? "You" : ivName}
                    </p>
                    <p className="text-[13px] leading-relaxed text-ink/90">{t.content}</p>
                  </div>
                </div>
              ))}
              <div ref={captionsEnd} />
            </div>
          )}
        </div>
        {panelOpen && (
          <div className="h-[68vh] shrink-0 lg:h-auto lg:w-[46%]">
            {codeOpen ? (
              <CodePanel sessionId={sessionId} onShare={(t) => interview.sendText(t)} onClose={() => setCodeOpen(false)} />
            ) : (
              <WhiteboardPanel onShare={(t) => interview.sendText(t)} onClose={() => setWhiteboardOpen(false)} />
            )}
          </div>
        )}
      </div>

      <p className="py-4 text-center text-[11px] text-ink-faint">
        {codeOpen
          ? `Solve it in the editor, then Share with ${ivName} to discuss.`
          : whiteboardOpen
            ? `Sketch your architecture, then Discuss to walk ${ivName} through it.`
            : `Speak naturally. ${ivName} waits for you to finish before responding.`}
      </p>
    </div>
  );
}

export default function MockInterviewPage() {
  return (
    <Suspense fallback={null}>
      <MockInterviewInner />
    </Suspense>
  );
}
