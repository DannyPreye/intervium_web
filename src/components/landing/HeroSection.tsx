"use client";

import React from "react";
import Image from "next/image";
import { Sparkle, MicrophoneStage } from "@phosphor-icons/react";
import { ReleaseAssets } from "@/lib/types";
import DownloadCTA from "@/components/ui/DownloadCTA";

export default function HeroSection({ assets }: { assets: ReleaseAssets }) {
  return (
<section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="aura pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="grid-faint pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black,transparent_75%)]"
          aria-hidden
        />
        <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div className="rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-violet/[0.08] px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
              <Sparkle size={13} weight="fill" />
              AI interview prep
            </span>

            <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance">
              Walk into any interview
              <br />
              <span className="text-violet-bright">genuinely</span> ready.
            </h1>

            <p className="mt-6 max-w-[34rem] text-[clamp(1rem,1.4vw,1.18rem)] leading-relaxed text-pretty text-ink-soft">
              Rehearse out loud with realistic AI mock interviews, get honest
              scored feedback, and master the concepts you fumble — with a voice
              coach that teaches until it clicks.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <DownloadCTA assets={assets} />
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3.5 text-[15px] font-semibold text-ink transition-colors hover:bg-white/[0.04]"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Brand mark visual (real asset, not a fake screenshot) */}
          <div className="relative mx-auto flex h-[320px] w-full max-w-[460px] items-center justify-center md:h-[440px]">
            <div className="breathe absolute h-[260px] w-[260px] rounded-full bg-violet/30 blur-[90px] md:h-[340px] md:w-[340px]" />
            <div className="absolute h-[300px] w-[300px] rounded-full border border-violet/15 md:h-[400px] md:w-[400px]" />
            <div className="absolute h-[220px] w-[220px] rounded-full border border-violet/10 md:h-[300px] md:w-[300px]" />
            <div className="floaty relative">
              <Image
                src="/icon.png"
                alt="Intavue — AI interview preparation"
                width={500}
                height={310}
                priority
                className="relative brightness-0 drop-shadow-[0_20px_60px_rgba(124,92,255,0.45)] grayscale invert "
                style={{ mixBlendMode: "screen" }}
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line-strong bg-bg-elevated/90 px-4 py-2 backdrop-blur-md">
              <MicrophoneStage size={15} weight="bold" className="text-violet-bright" />
              <span className="text-[12.5px] font-medium text-ink">
                Practice out loud, get scored feedback
              </span>
            </div>
          </div>
        </div>
      </section>
  );
}
