"use client";

import React from "react";
import { ReleaseAssets } from "@/lib/types";
import Reveal from "@/components/ui/Reveal";
import DownloadCTA from "@/components/ui/DownloadCTA";

export default function CTASection({ assets }: { assets: ReleaseAssets }) {
  return (
<section className="relative overflow-hidden border-t border-line py-28">
        <div
          className="aura pointer-events-none absolute inset-x-0 top-auto bottom-0 h-[420px] rotate-180"
          aria-hidden
        />
        <Reveal className="container-x relative text-center">
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.04] font-extrabold tracking-[-0.03em] text-balance">
            Walk into your next interview with backup.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.1rem] leading-relaxed text-pretty text-ink-soft">
            Practice until you are sharp, then keep your copilot on screen and
            out of sight. Free to download, no card needed.
          </p>
          <div className="mt-9 flex justify-center">
            <DownloadCTA assets={assets} />
          </div>
          <p className="mt-5 font-mono text-[12px] text-ink-faint">
            {assets.version ? `${assets.version} · ` : ""}Free for Windows and
            macOS
          </p>
        </Reveal>
      </section>
  );
}
