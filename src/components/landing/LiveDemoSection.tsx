"use client";

import React, { useState } from "react";
import { Play, Sparkle } from "@phosphor-icons/react";
import { ReleaseAssets } from "@/lib/types";
import { useDownloadHref } from "@/lib/hooks";
import Reveal from "@/components/ui/Reveal";
import WebAppCTA from "@/components/ui/WebAppCTA";

/* Real product walkthrough. Click-to-play: only the lightweight poster loads with
 * the page — the video (served with faststart so it streams progressively) is
 * fetched only when a visitor presses play, so the landing page stays fast. */
export default function LiveDemoSection({ assets }: { assets: ReleaseAssets }) {
  const downloadHref = useDownloadHref(assets);
  const [playing, setPlaying] = useState(false);

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
            See it for yourself.
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-pretty text-ink-soft">
            Watch a real walkthrough — voice mock interviews, a live coding round, and
            honest scored feedback. No sign-up needed.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-12 max-w-3xl">
          <div className="surface overflow-hidden rounded-3xl">
            <div className="relative aspect-[1280/566] w-full bg-black">
              {playing ? (
                <video
                  className="absolute inset-0 h-full w-full object-contain"
                  src="/demo/intavue-demo.mp4"
                  poster="/demo/intavue-demo-poster.jpg"
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  aria-label="Play the Intavue demo"
                  className="group absolute inset-0 h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/demo/intavue-demo-poster.jpg"
                    alt="Intavue product walkthrough"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/25 transition-colors group-hover:from-black/50" />
                  <span className="absolute top-1/2 left-1/2 grid h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--cta)] text-white shadow-[0_10px_50px_-8px_rgba(107,74,240,0.9)] transition-transform duration-200 group-hover:scale-105">
                    <Play size={28} weight="fill" className="ml-1" />
                  </span>
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-[12.5px] font-medium whitespace-nowrap text-white backdrop-blur-sm">
                    Watch the walkthrough
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <WebAppCTA label="Try it free — no install" />
            <a
              href={downloadHref}
              className="text-[12.5px] text-ink-faint underline-offset-4 hover:text-ink-soft hover:underline"
            >
              or download the desktop app
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
