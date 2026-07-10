"use client";

import React from "react";
import Image from "next/image";
import { Quotes } from "@phosphor-icons/react";
import { TESTIMONIALS } from "@/lib/testimonials";
import Reveal from "@/components/ui/Reveal";

/** Social proof. Renders nothing until real, permission-granted testimonials
 *  are added in src/lib/testimonials.ts — no placeholder / fabricated data. */
export default function TestimonialsSection() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section id="testimonials" className="border-t border-line py-24 md:py-28">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
            Loved by job seekers
          </span>
          <h2 className="mt-5 font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
            Prep that shows up on interview day.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 0.05}>
              <figure className="surface flex h-full flex-col rounded-3xl p-7">
                <Quotes
                  size={26}
                  weight="fill"
                  className="text-violet-bright/50"
                  aria-hidden
                />
                <blockquote className="mt-4 flex-1 text-[14.5px] leading-relaxed text-ink-soft">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  {t.avatar ? (
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-violet/15 font-display text-[15px] font-bold text-violet-bright">
                      {t.name.charAt(0)}
                    </span>
                  )}
                  <span className="leading-tight">
                    <span className="block text-[13.5px] font-semibold text-ink">
                      {t.name}
                    </span>
                    <span className="block text-[12px] text-ink-faint">
                      {t.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
