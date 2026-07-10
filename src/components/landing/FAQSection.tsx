"use client";

import React from "react";
import { CaretDown } from "@phosphor-icons/react";
import { FAQ } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

export default function FAQSection() {
  return (
<section
        id="faq"
        className="border-t border-line bg-bg-elevated/40 py-24 md:py-28"
      >
        <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
              Questions, answered.
            </h2>
            <p className="mt-4 max-w-sm text-[1rem] leading-relaxed text-pretty text-ink-soft">
              Straight answers on how the mock interviews work, what runs where,
              and how your data is handled.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-bg-elevated">
              {FAQ.map((item) => (
                <details key={item.q} className="group px-6 py-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-semibold text-ink marker:hidden">
                    {item.q}
                    <CaretDown
                      size={17}
                      weight="bold"
                      className="shrink-0 text-ink-faint transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="pb-5 text-[14px] leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
  );
}