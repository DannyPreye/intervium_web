"use client";

import React from "react";
import { REQUIREMENTS } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";
import OsGlyph from "@/components/ui/OsGlyph";

export default function RequirementsSection() {
  return (
<section id="requirements" className="border-t border-line py-24 md:py-28">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-[clamp(2rem,3.6vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.025em] text-balance">
              Light on your machine.
            </h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-soft text-pretty">
              Intavue runs on the hardware you already have. Here is what each
              platform needs.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 grid divide-y divide-line overflow-hidden rounded-3xl border border-line bg-bg-elevated md:grid-cols-3 md:divide-x md:divide-y-0">
              {REQUIREMENTS.map((r) => (
                <div key={r.os} className="flex flex-col p-8">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong text-ink">
                      <OsGlyph os={r.os} size={20} />
                    </span>
                    <span className="font-display text-xl font-semibold text-ink">
                      {r.name}
                    </span>
                  </div>

                  <dl className="mt-6 space-y-3.5">
                    {r.specs.map(([k, v]) => (
                      <div
                        key={k}
                        className="flex items-baseline justify-between gap-4"
                      >
                        <dt className="shrink-0 text-[12px] uppercase tracking-wide text-ink-faint">
                          {k}
                        </dt>
                        <dd className="text-right text-[13.5px] font-medium text-ink">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </Reveal>

          <p className="mt-6 text-[13px] text-ink-faint">
            An internet connection and a free account are required for AI
            features. The app updates itself in the background.
          </p>
        </div>
      </section>
  );
}