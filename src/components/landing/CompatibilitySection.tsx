"use client";

import React from "react";
import { SHARE_PLATFORMS } from "@/lib/constants";

export default function CompatibilitySection() {
  return (
<section className="border-y border-line bg-bg-elevated/40">
        <div className="container-x py-9">
          <p className="text-center font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase">
            Stays hidden during screen-share on
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {SHARE_PLATFORMS.map((p) => (
              <img
                key={p.slug}
                src={`https://cdn.simpleicons.org/${p.slug}/b3adc9`}
                alt={p.name}
                width={26}
                height={26}
                className="h-6 opacity-70 grayscale transition hover:opacity-100"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
  );
}
