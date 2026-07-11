"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { PersonaMeta } from "@/lib/personas";

/** A grid of selectable persona cards (avatar + name + one-line style). */
export default function PersonaPicker({
  personas,
  value,
  onChange,
}: {
  personas: PersonaMeta[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {personas.map((p) => {
        const on = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={on}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
              on ? "border-violet/50 bg-violet/10 ring-1 ring-violet/30" : "border-line-strong bg-bg-raised hover:border-violet/30",
            )}
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white shadow-inner"
              style={{ background: `linear-gradient(135deg, ${p.accent}, ${p.accent}aa)` }}
            >
              {p.initial}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold text-ink">{p.name}</span>
              <span className="block truncate text-[11.5px] text-ink-faint">{p.tagline}</span>
            </span>
            {on && <CheckCircle size={18} weight="fill" className="shrink-0 text-violet-bright" />}
          </button>
        );
      })}
    </div>
  );
}
