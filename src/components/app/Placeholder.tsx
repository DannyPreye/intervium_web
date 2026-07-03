"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/misc";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Branded placeholder for feature surfaces being ported to the web app. */
export default function Placeholder({
  title,
  icon,
  blurb,
}: {
  title: string;
  icon: React.ElementType;
  blurb: string;
}) {
  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
      <EmptyState
        icon={icon}
        title="Coming to the web app"
        description={blurb}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "secondary" }))}>
              Back to home
            </Link>
            <Link href="/mock-interview" className={cn(buttonVariants())}>
              Start a mock interview
            </Link>
          </div>
        }
      />
    </div>
  );
}
