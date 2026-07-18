"use client";

import Link from "next/link";
import { EnvelopeSimple, Lifebuoy, ArrowSquareOut, CaretDown, Bug } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FAQ } from "@/lib/faq";
import { mountScouti, isScoutiLoaded } from "@/lib/scouti";

const SUPPORT_EMAIL = "support@intavue.app";

export default function SupportPage() {
  // Opens a short Scouti chat to capture the bug in context; if the feedback
  // widget isn't loaded (cookies not accepted), fall back to an email.
  const reportBug = () => {
    if (isScoutiLoaded()) {
      mountScouti("report_bug");
    } else {
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Bug report")}`;
    }
  };

  return (
    <div className="mx-auto">
      <PageHeader title="Support" subtitle="Questions, issues, or feedback — we're here to help." />

      {/* Contact */}
      <Card className="mb-6 flex flex-col gap-4 border-violet/25 bg-gradient-to-br from-violet/[0.14] via-violet/[0.04] to-transparent p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet/15 text-violet-bright">
            <Lifebuoy size={24} weight="fill" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink">Email our team</p>
            <p className="text-[13.5px] text-ink-soft">
              Write to <span className="font-medium text-ink">{SUPPORT_EMAIL}</span> — we typically reply within 24 hours.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" onClick={reportBug}>
            <Bug size={16} weight="bold" /> Report a bug
          </Button>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Intavue support")}`}>
            <Button className="w-full sm:w-auto">
              <EnvelopeSimple size={16} weight="bold" /> Email us
            </Button>
          </a>
        </div>
      </Card>

      {/* Quick links */}
      <div className="mb-9 grid gap-3 sm:grid-cols-2">
        <Link href="/billing" className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg-elevated p-4 transition-colors hover:border-violet/30">
          <div>
            <p className="text-[14px] font-semibold text-ink">Billing &amp; credits</p>
            <p className="text-[12.5px] text-ink-faint">Plans, top-ups, and payment history</p>
          </div>
          <ArrowSquareOut size={16} className="shrink-0 text-ink-faint transition-colors group-hover:text-violet-bright" />
        </Link>
        <Link href="/privacy" className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg-elevated p-4 transition-colors hover:border-violet/30">
          <div>
            <p className="text-[14px] font-semibold text-ink">Privacy &amp; terms</p>
            <p className="text-[12.5px] text-ink-faint">How we handle your data</p>
          </div>
          <ArrowSquareOut size={16} className="shrink-0 text-ink-faint transition-colors group-hover:text-violet-bright" />
        </Link>
      </div>

      {/* FAQ */}
      <h2 className="mb-4 text-[13px] font-semibold tracking-wide text-ink-faint uppercase">Frequently asked</h2>
      <div className="space-y-2.5">
        {FAQ.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-line bg-bg-elevated px-5 py-4 transition-colors hover:border-line-strong"
          >
            <summary className="flex list-none items-center justify-between gap-3 text-[14px] font-medium text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
              <CaretDown size={16} weight="bold" className="shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-9 text-center text-[12px] text-ink-faint">
        Still stuck? Email <span className="text-ink-soft">{SUPPORT_EMAIL}</span> and we&rsquo;ll get you sorted.
      </p>
    </div>
  );
}
