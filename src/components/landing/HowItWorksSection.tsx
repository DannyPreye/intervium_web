"use client";

import React from "react";
import { STEPS } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

export default function HowItWorksSection() {
  return (
<section
        id="how"
        className="border-t border-line bg-bg-elevated/40 py-24 md:py-28"
      >
        <div className="container-x">
          <Reveal className="max-w-xl">
            <h2 className="font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
              From sign-up to interview-ready.
            </h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-pretty text-ink-soft">
              No install, no setup labyrinth. You are practising within minutes
              and ready for the real thing the same day.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.08}>
                <div className="h-full bg-bg-elevated p-8 md:p-9">
                  <span className="font-mono text-5xl font-bold text-violet/30">
                    {s.num}
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}