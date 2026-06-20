"use client";

import React from "react";
import { STEALTH } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";
import { EyeSlash, CursorClick, Lightning, ShieldCheck } from "@phosphor-icons/react";

export default function StealthSection() {
  return (
<section id="stealth" className="relative py-24 md:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
              Built for the live moment
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.06] font-bold tracking-[-0.025em] text-balance">
              The help is right there.
              <br />
              The screen stays clean.
            </h2>
            <p className="mt-5 max-w-[32rem] text-[1.05rem] leading-relaxed text-pretty text-ink-soft">
              Most interview tools live in a separate tab anyone can see.
              Intavue runs as a true overlay that the operating system keeps out
              of every recording and share, so your prep travels with you into
              the interview itself.
            </p>
            <p className="mt-5 max-w-[32rem] text-sm leading-relaxed text-ink-faint">
              Capture protection is available on Windows 10 version 2004 and
              newer, and on macOS.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {STEALTH.map((s) => (
                <div
                  key={s.title}
                  className="surface rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-violet/25 bg-violet/10 text-violet-bright">
                    <s.icon size={21} weight="bold" />
                  </div>
                  <h3 className="font-display text-[1.05rem] font-semibold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
  );
}
