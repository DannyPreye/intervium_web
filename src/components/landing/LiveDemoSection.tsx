"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  Play,
  ArrowClockwise,
  SpeakerHigh,
  SpeakerSlash,
  ArrowRight,
  Sparkle,
  Code,
  Microphone,
} from "@phosphor-icons/react";
import { ReleaseAssets } from "@/lib/types";
import { useDownloadHref } from "@/lib/hooks";
import Reveal from "@/components/ui/Reveal";
import WebAppCTA from "@/components/ui/WebAppCTA";

/* A scripted, zero-cost preview of a live interview with Alex. No API calls —
 * captions are typed out on a timeline and (optionally) spoken with the browser's
 * built-in speech synthesis after the visitor presses play. It mirrors the real
 * product loop: voice Q&A → a live coding beat → the promise of a scored report. */

type Turn =
  | { who: "alex" | "you"; text: string }
  | { who: "code"; title: string; lines: string[]; note: string };

const SCRIPT: Turn[] = [
  { who: "alex", text: "Hey — thanks for hopping on. Let's start easy: tell me about a project you're genuinely proud of." },
  { who: "you", text: "Sure. I built a real-time collaborative editor — multiple people editing one document with no conflicts." },
  { who: "alex", text: "Nice. What was the hardest part, and how did you solve it?" },
  { who: "you", text: "Concurrent edits. I used CRDTs so operations commute and always converge — no locking needed." },
  { who: "alex", text: "Good instinct. Let's make it concrete — here's a quick one." },
  {
    who: "code",
    title: "Merge two sorted arrays",
    lines: [
      "function merge(a, b) {",
      "  const out = []; let i = 0, j = 0;",
      "  while (i < a.length && j < b.length)",
      "    out.push(a[i] <= b[j] ? a[i++] : b[j++]);",
      "  return [...out, ...a.slice(i), ...b.slice(j)];",
      "}",
    ],
    note: "You solve it live in the editor — Alex watches your approach.",
  },
  { who: "alex", text: "Walk me through your approach before you run it." },
  { who: "you", text: "Two pointers from the front of each array — O(n + m) time, O(1) extra space." },
  { who: "alex", text: "Exactly what I'd want to hear. After this you'd get a scored report — and a coach for anything you fumbled." },
];

type Phase = "idle" | "playing" | "done";

export default function LiveDemoSection({ assets }: { assets: ReleaseAssets }) {
  const reduce = useReducedMotion();
  const downloadHref = useDownloadHref(assets);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0); // number of fully-revealed turns
  const [typed, setTyped] = useState(""); // text currently being typed
  const [codeLines, setCodeLines] = useState(0); // revealed code lines
  const [active, setActive] = useState<"alex" | "you" | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  const runId = useRef(0);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  // Auto-scroll the transcript as it grows.
  useEffect(() => {
    streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "smooth" });
  }, [typed, step, codeLines]);

  const cancel = useCallback(() => {
    runId.current += 1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setActive(null);
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  const wait = (ms: number, id: number) =>
    new Promise<void>((res) => {
      const t = setTimeout(() => res(), ms);
      // if the run was cancelled, resolve early on next tick
      if (id !== runId.current) {
        clearTimeout(t);
        res();
      }
    });

  const speak = (text: string, id: number) =>
    new Promise<void>((resolve) => {
      if (!soundRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) {
        resolve();
        return;
      }
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.03;
        u.pitch = 0.95;
        const voices = window.speechSynthesis.getVoices();
        const pick =
          voices.find((v) => /en(-|_)?(GB|US)/i.test(v.lang) && /male|daniel|alex|guy|google uk/i.test(v.name)) ||
          voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
          voices[0];
        if (pick) u.voice = pick;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        // hard fallback so we never hang if the engine stalls
        setTimeout(() => {
          if (id === runId.current) resolve();
        }, Math.min(9000, 900 + text.length * 55));
      } catch {
        resolve();
      }
    });

  const typeOut = (text: string, id: number) =>
    new Promise<void>((resolve) => {
      let i = 0;
      const tick = () => {
        if (id !== runId.current) return resolve();
        i += 1;
        setTyped(text.slice(0, i));
        if (i >= text.length) return resolve();
        setTimeout(tick, reduce ? 0 : 16 + Math.random() * 22);
      };
      tick();
    });

  const revealCode = async (lines: string[], id: number) => {
    for (let i = 1; i <= lines.length; i++) {
      if (id !== runId.current) return;
      setCodeLines(i);
      await wait(reduce ? 40 : 240, id);
    }
  };

  const run = useCallback(async () => {
    cancel();
    const id = (runId.current += 1);
    setPhase("playing");
    setStep(0);
    setTyped("");
    setCodeLines(0);

    for (let i = 0; i < SCRIPT.length; i++) {
      if (id !== runId.current) return;
      const turn = SCRIPT[i];
      setTyped("");

      if (turn.who === "code") {
        setActive(null);
        await revealCode(turn.lines, id);
        await wait(reduce ? 300 : 1500, id);
      } else {
        setActive(turn.who);
        const voice = turn.who === "alex" ? speak(turn.text, id) : Promise.resolve();
        await typeOut(turn.text, id);
        // let Alex's voice finish (capped); brief natural pause for the candidate
        await Promise.race([voice, wait(turn.who === "alex" ? 4500 : 0, id)]);
        await wait(turn.who === "alex" ? 450 : 850, id);
      }

      if (id !== runId.current) return;
      setStep(i + 1);
      setTyped("");
    }
    setActive(null);
    setPhase("done");
  }, [cancel, reduce]);

  const toggleSound = () => {
    setSoundOn((s) => {
      const next = !s;
      if (!next && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      return next;
    });
  };

  const bars = [0, 1, 2, 3, 4, 5, 6];

  return (
    <section id="demo" className="relative overflow-hidden border-t border-line py-24 md:py-28">
      <div className="aura pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-violet/[0.08] px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
            <Sparkle size={13} weight="fill" />
            Live demo
          </span>
          <h2 className="mt-6 font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
            Hear it for yourself.
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-pretty text-ink-soft">
            Press play for a 60-second taste of a real mock interview — voice questions,
            a live coding round, and honest feedback. No sign-up needed.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-12 max-w-3xl">
          <div className="surface overflow-hidden rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet to-violet-deep text-white">
                  <Microphone size={18} weight="fill" />
                  {active === "alex" && (
                    <motion.span
                      className="absolute inset-0 rounded-full border border-violet-bright"
                      animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                </div>
                <div className="leading-tight">
                  <p className="text-[14px] font-semibold text-ink">Alex</p>
                  <p className="text-[11.5px] text-ink-faint">AI interviewer</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full border border-line-strong px-3 py-1 text-[11px] font-medium text-ink-soft sm:inline">
                  Software Engineer · Screen
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                    animate={phase === "playing" ? { opacity: [1, 0.25, 1] } : {}}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  {phase === "playing" ? "Live" : phase === "done" ? "Ended" : "Ready"}
                </span>
              </div>
            </div>

            {/* Transcript */}
            <div ref={streamRef} className="relative h-[340px] space-y-4 overflow-y-auto px-5 py-6 sm:px-7">
              {phase === "idle" ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <button
                      onClick={run}
                      className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--cta)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_40px_-8px_rgba(107,74,240,0.7)] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <Play size={17} weight="fill" />
                      Play a 60-second demo
                    </button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-ink-faint">
                      <SpeakerHigh size={13} /> Best with sound on
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {SCRIPT.slice(0, step).map((t, i) => (
                    <Bubble key={i} turn={t} codeLines={t.who === "code" ? 99 : 0} bars={bars} active={null} reduce={reduce} />
                  ))}
                  {step < SCRIPT.length && (
                    <Bubble
                      turn={SCRIPT[step]}
                      typed={typed}
                      codeLines={codeLines}
                      bars={bars}
                      active={active}
                      reduce={reduce}
                    />
                  )}
                  {phase === "done" && (
                    <div className="rounded-2xl border border-violet/20 bg-violet/[0.06] px-4 py-3 text-center text-[13px] text-ink-soft">
                      That's the loop — scored report + a voice coach come next.{" "}
                      <Link href="/register" className="font-semibold text-violet-bright hover:underline">
                        Try it for real →
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
              {phase === "idle" ? (
                <span className="text-[12px] text-ink-faint">A scripted preview — the real thing listens and responds to you.</span>
              ) : (
                <button
                  onClick={run}
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-white/[0.04]"
                >
                  {phase === "done" ? <ArrowClockwise size={15} weight="bold" /> : <Play size={14} weight="fill" />}
                  {phase === "done" ? "Replay" : "Restart"}
                </button>
              )}
              <button
                onClick={toggleSound}
                aria-pressed={soundOn}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-white/[0.04]"
              >
                {soundOn ? <SpeakerHigh size={15} weight="fill" /> : <SpeakerSlash size={15} />}
                {soundOn ? "Sound on" : "Muted"}
              </button>

              <div className="ml-auto flex items-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-violet-bright hover:underline"
                >
                  Start your interview
                  <ArrowRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <WebAppCTA label="Try it free — no install" />
            <a href={downloadHref} className="text-[12.5px] text-ink-faint underline-offset-4 hover:text-ink-soft hover:underline">
              or download the desktop app
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Waveform({ bars, color, reduce }: { bars: number[]; color: string; reduce: boolean | null }) {
  return (
    <div className="flex h-5 items-center gap-[3px]">
      {bars.map((b) => (
        <motion.span
          key={b}
          className={`w-[3px] rounded-full ${color}`}
          style={{ height: 6 }}
          animate={reduce ? { height: 12 } : { height: [6, 18, 9, 20, 6] }}
          transition={reduce ? {} : { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: b * 0.08 }}
        />
      ))}
    </div>
  );
}

function Bubble({
  turn,
  typed,
  codeLines,
  bars,
  active,
  reduce,
}: {
  turn: Turn;
  typed?: string;
  codeLines: number;
  bars: number[];
  active: "alex" | "you" | null;
  reduce: boolean | null;
}) {
  if (turn.who === "code") {
    const shown = codeLines >= 99 ? turn.lines.length : codeLines;
    return (
      <div className="mx-auto w-full max-w-[92%]">
        <div className="overflow-hidden rounded-2xl border border-line-strong bg-bg-raised">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2">
            <Code size={14} weight="bold" className="text-violet-bright" />
            <span className="text-[12px] font-semibold text-ink">{turn.title}</span>
            <span className="ml-auto font-mono text-[10.5px] text-ink-faint">solution.js</span>
          </div>
          <pre className="overflow-x-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-ink/90">
            {turn.lines.slice(0, shown).map((l, i) => (
              <div key={i}>
                <span className="mr-3 select-none text-ink-faint">{i + 1}</span>
                {l || " "}
              </div>
            ))}
          </pre>
          <p className="border-t border-line px-4 py-2 text-[11.5px] text-ink-faint">{turn.note}</p>
        </div>
      </div>
    );
  }

  const isAlex = turn.who === "alex";
  const text = typed !== undefined ? typed : turn.text;
  const isActive = active === turn.who;

  return (
    <div className={`flex ${isAlex ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[82%] ${isAlex ? "" : "text-right"}`}>
        <p className={`mb-1 text-[10.5px] font-semibold tracking-wide uppercase ${isAlex ? "text-violet-bright" : "text-ink-faint"}`}>
          {isAlex ? "Alex" : "You"}
        </p>
        <div
          className={`rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed ${
            isAlex
              ? "border border-line-strong bg-bg-raised text-ink"
              : "bg-violet/15 text-ink"
          }`}
        >
          {text}
          {isActive && text.length < turn.text.length && (
            <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-violet-bright" />
          )}
          {isActive && (
            <div className={`mt-2 ${isAlex ? "" : "flex justify-end"}`}>
              <Waveform bars={bars} color={isAlex ? "bg-violet-bright" : "bg-ink-faint"} reduce={reduce} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
