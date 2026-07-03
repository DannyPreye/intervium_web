import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-bg-raised px-2.5 py-1 text-[11px] font-semibold text-ink-soft",
        className
      )}
      {...props}
    />
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-white/[0.06]", className)}
      {...props}
    />
  );
}

/** Composed empty / placeholder state (used until a feature lands in the app). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-bg-elevated text-violet-bright">
        <Icon size={26} weight="duotone" />
      </div>
      <div className="space-y-1.5">
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <p className="text-sm leading-relaxed text-ink-soft">{description}</p>
      </div>
      {action}
    </div>
  );
}
