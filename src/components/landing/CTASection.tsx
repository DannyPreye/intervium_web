"use client";

import React from "react";
import { ReleaseAssets } from "@/lib/types";
import { useDownloadHref } from "@/lib/hooks";
import Reveal from "@/components/ui/Reveal";
import WebAppCTA from "@/components/ui/WebAppCTA";
import DownloadHelp from "@/components/landing/DownloadHelp";

export default function CTASection({ assets }: { assets: ReleaseAssets }) {
  const downloadHref = useDownloadHref(assets);
  return (
<section className="relative overflow-hidden border-t border-line py-28">
        <div
          className="aura pointer-events-none absolute inset-x-0 top-auto bottom-0 h-[420px] rotate-180"
          aria-hidden
        />
        <Reveal className="container-x relative text-center">
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.04] font-extrabold tracking-[-0.03em] text-balance">
            Walk into your next interview genuinely ready.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.1rem] leading-relaxed text-pretty text-ink-soft">
            Rehearse with realistic mock interviews, get honest feedback, and
            close your gaps with an AI coach. Free to start, right in your browser
            — no install, no card needed.
          </p>
          <div className="mt-9 flex justify-center">
            <WebAppCTA />
          </div>
          <p className="mt-5 text-[13.5px] text-ink-soft">
            Also available as a desktop app —
            <a
              href={downloadHref}
              className="ml-1.5 font-medium text-ink underline-offset-4 hover:underline"
            >
              download for Windows &amp; macOS
            </a>
          </p>
          <div className="mt-3 flex justify-center">
            <DownloadHelp />
          </div>
        </Reveal>
      </section>
  );
}
