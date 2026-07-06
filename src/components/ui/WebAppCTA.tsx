"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Browser } from "@phosphor-icons/react";

/** Primary "use it in the browser" call-to-action. No install, no code-signing —
 * the friction-free path we lead with. Sends visitors to create a free account. */
export default function WebAppCTA({
  label = "Start free in your browser",
  href = "/register",
  className = "",
  showIcon = true,
  showArrow = true,
}: {
  label?: string;
  href?: string;
  className?: string;
  showIcon?: boolean;
  showArrow?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-full bg-[var(--cta)] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_40px_-8px_rgba(107,74,240,0.7)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 ${className}`}
    >
      {showIcon && <Browser size={18} weight="bold" />}
      {label}
      {showArrow && (
        <ArrowRight size={16} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </Link>
  );
}
