"use client";

import React from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";
import { PLANS } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

export default function PricingSection() {
  return (
<section id="pricing" className="border-t border-line py-24 md:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
              Pricing
            </span>
            <h2 className="mt-5 font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
              Start free. Upgrade when it pays for itself.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-start">
            {PLANS.map((plan) => (
              <Reveal key={plan.name}>
                <div
                  className={`relative h-full rounded-3xl p-8 ${
                    plan.highlight
                      ? "border border-violet/40 bg-violet/[0.06] shadow-[0_24px_80px_-32px_rgba(124,92,255,0.55)] lg:-mt-4 lg:pb-12"
                      : "surface"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute top-7 right-7 rounded-full bg-[#6b4af0] px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-white uppercase">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-extrabold tracking-tight text-ink">
                      {plan.price}
                    </span>
                    <span className="text-sm text-ink-faint">
                      {plan.period}
                    </span>
                  </div>
                  {/* Credits translated into the thing people actually buy:
                      time. Removes the "what is a credit worth?" guesswork. */}
                  <p className="mt-3 inline-block rounded-full border border-violet/25 bg-violet/[0.08] px-3 py-1 font-mono text-[11px] font-semibold tracking-tight text-violet-bright">
                    {plan.meter}
                  </p>

                  <p className="mt-3 min-h-[2.5rem] text-[13.5px] leading-relaxed text-ink-soft">
                    {plan.blurb}
                  </p>

                  {plan.highlight ? (
                    <a
                      href="/register"
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#6b4af0] px-6 py-3 text-[14px] font-semibold text-white transition-transform hover:-translate-y-0.5"
                    >
                      {plan.cta}
                      <ArrowRight size={15} weight="bold" />
                    </a>
                  ) : (
                    <a
                      href="/register"
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-line-strong px-6 py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-white/[0.04]"
                    >
                      {plan.cta}
                    </a>
                  )}

                  <ul className="mt-7 space-y-3">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check
                          size={16}
                          weight="bold"
                          className="mt-0.5 shrink-0 text-violet-bright"
                        />
                        <span className="text-[13.5px] leading-snug text-ink-soft">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Plain-English credit rates — the single biggest source of pricing
              anxiety is not knowing what a credit buys. */}
          <Reveal>
            <p className="mx-auto mt-10 max-w-2xl text-center text-[13px] leading-relaxed text-ink-faint">
              <span className="font-semibold text-ink-soft">How credits work:</span>{" "}
              live voice sessions — mock interviews and Concept Coach — cost 5
              credits a minute, because audio streams both ways. Everything else
              is a flat 1–5 credits per action (a resume analysis or cover letter
              is 5, a code run is 1). Top-up credits never expire.
            </p>
          </Reveal>
        </div>
      </section>
  );
}