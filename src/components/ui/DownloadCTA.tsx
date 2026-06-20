"use client";

import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { ReleaseAssets } from "@/lib/types";
import { useOS } from "@/lib/hooks";
import { GITHUB_RELEASES, OS_META } from "@/lib/constants";
import OsGlyph from "./OsGlyph";

export default function DownloadCTA({
  assets,
  className = "",
  showIcon = true,
  showArrow = true,
}: {
  assets: ReleaseAssets;
  className?: string;
  showIcon?: boolean;
  showArrow?: boolean;
}) {
  const os = useOS();
  const meta = os !== "unknown" ? OS_META[os] : null;
  const url = os !== "unknown" ? assets[os] : null;
  const href = url ?? GITHUB_RELEASES;
  const label = meta?.label ?? "Download for desktop";

  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-full bg-[#6b4af0] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_40px_-8px_rgba(107,74,240,0.7)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 ${className}`}
    >
      {showIcon && <OsGlyph os={os} size={18} />}
      {label}
      {showArrow && (
        <ArrowRight
          size={16}
          weight="bold"
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      )}
    </a>
  );
}
