"use client";

import React from "react";
import Image from "next/image";
import { GITHUB_RELEASES } from "@/lib/constants";
import { ReleaseAssets } from "@/lib/types";
import DownloadCTA from "../ui/DownloadCTA";

export default function Footer({ assets }: { assets: ReleaseAssets }) {
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/mark.png" alt="Intavue" width={28} height={28} className="h-7 w-7" />
          <span className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink">
            Intavue
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-5 gap-y-3  text-[13.5px] text-ink-soft md:gap-x-8">
          <a href="#features" className="transition-colors hover:text-ink">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-ink">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-ink">
            FAQ
          </a>
          <a href="#requirements" className="transition-colors hover:text-ink">
            Requirements
          </a>
          <DownloadCTA
            showArrow={false}
            showIcon={false}
            className="b bg-transparent p-0 text-[13.5px] transition-colors hover:text-ink"
            assets={assets}
          />
        </nav>
        <p className="font-mono text-[12px] text-ink-faint">
          © {new Date().getFullYear()} Intavue
        </p>
      </div>
    </footer>
  );
}
