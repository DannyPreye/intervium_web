"use client";

import React, { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { SCREENSHOTS, type Shot } from "@/lib/screenshots";

/* A screenshot in a browser-style frame. A branded placeholder always sits
 * underneath; the real screenshot fades in on top only once it actually loads,
 * and is dropped if the file is missing — so a broken-image icon can never show,
 * and the section upgrades itself the moment you add the files. */
function BrowserFrame({ shot, priority }: { shot: Shot; priority?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // A cached image can already be complete before React attaches onLoad, so the
  // load event never fires — check directly on mount so it doesn't stay hidden.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, []);
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-bg-elevated shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]">
      <div className="flex items-center gap-1.5 border-b border-line bg-bg-raised/60 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 truncate font-mono text-[11px] font-medium text-ink-faint">intavue.app · {shot.title}</span>
      </div>
      <div className="relative aspect-[1600/766] w-full overflow-hidden">
        {/* Branded placeholder — always present underneath the screenshot. */}
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-violet/[0.16] via-bg-elevated to-bg">
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mark.png" alt="" aria-hidden className="h-9 w-9 opacity-50" />
            <p className="font-display text-[15px] font-semibold text-ink/90">{shot.title}</p>
          </div>
        </div>
        {/* Real screenshot: hidden until it loads (no broken-icon flash), removed if missing. */}
        {!failed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={shot.src}
            alt={shot.alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  const [hero, ...rest] = SCREENSHOTS;
  return (
    <section id="product" className="border-t border-line py-24 md:py-28">
      <div className="container-x">
        <Reveal className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-violet/[0.08] px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
            See it in action
          </span>
          <h2 className="mt-6 font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.08] font-bold tracking-[-0.025em] text-balance">
            The real product, not a mockup.
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-pretty text-ink-soft">
            Voice mock interviews, live coding rounds, a concept coach, and an ATS resume builder — everything runs in your browser.
          </p>
        </Reveal>

        {hero && (
          <Reveal className="mt-14">
            <BrowserFrame shot={hero} priority />
            <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">{hero.title}.</span> {hero.caption}
            </p>
          </Reveal>
        )}

        {rest.length > 0 && (
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {rest.map((s, i) => (
              <Reveal key={s.src} delay={i * 0.08}>
                <BrowserFrame shot={s} />
                <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{s.title}.</span> {s.caption}
                </p>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
