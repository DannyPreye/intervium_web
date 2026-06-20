"use client";

import React from "react";
import { FEATURES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";
import { MicrophoneStage, FileMagnifyingGlass, ChatTeardropText, BookOpen } from "@phosphor-icons/react";

export default function FeaturesSection() {
  return (
<section id="features" className="border-t border-line py-24 md:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
              Everything you need to walk in ready.
            </h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-pretty text-ink-soft">
              A focused set of tools that get you sharp before the interview and
              keep you steady during it, all powered by AI that knows your
              background.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 0.06}
                className={f.wide ? "sm:col-span-2 lg:col-span-3" : ""}
              >
                <div
                  className={`surface group h-full rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1 ${
                    f.wide ? "sm:p-9" : ""
                  }`}
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-violet/25 bg-violet/10 text-violet-bright transition-colors group-hover:bg-violet/20">
                    <f.icon size={23} weight="bold" />
                  </div>
                  <h3
                    className={`font-display font-semibold text-ink ${
                      f.wide ? "text-2xl" : "text-[1.15rem]"
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p
                    className={`mt-2.5 leading-relaxed text-ink-soft ${
                      f.wide ? "max-w-md text-[15px]" : "text-[13.5px]"
                    }`}
                  >
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}
