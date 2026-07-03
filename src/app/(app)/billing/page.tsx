"use client";

import { useEffect, useState } from "react";
import { Sparkle, Gift, Copy, Check, CheckCircle } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { api, unwrap } from "@/lib/api";
import { cn } from "@/lib/utils";

type Me = { credits?: number; plan?: string };
type Referral = { code?: string; reward?: number; referredCount?: number; creditsEarned?: number };

const PLANS = [
  { name: "Free", price: "$0", period: "forever", features: ["50 credits on signup", "Prep tools + a taste of live sessions"], highlight: false },
  { name: "Pro", price: "$15", period: "/mo", features: ["1,000 credits every cycle", "~3 hrs of live voice interviews", "Everything, unlimited practice"], highlight: true },
  { name: "Top-up", price: "from $5", period: "one-time", features: ["100 credits for $5", "Credits never expire", "Stack on any plan"], highlight: false },
];

export default function BillingPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [ref, setRef] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api("/v1/user/me").then((r) => setMe(unwrap<Me>(r))).catch(() => setMe({}));
    api("/v1/user/referral").then((r) => setRef(unwrap<Referral>(r))).catch(() => setRef({}));
  }, []);

  const copy = () => {
    if (!ref?.code) return;
    navigator.clipboard.writeText(ref.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Billing" subtitle="Credits, plans, and referrals." />

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
      {/* Credit hero */}
      <Card className="flex items-center justify-between gap-4 border-violet/25 bg-gradient-to-br from-violet/[0.16] via-violet/[0.05] to-transparent p-6">
        <div>
          <p className="text-[12px] font-semibold tracking-widest text-ink-faint uppercase">Balance</p>
          {me === null ? (
            <Skeleton className="mt-2 h-9 w-28" />
          ) : (
            <p className="mt-1 font-display text-4xl font-bold text-ink">
              {me.credits ?? 0} <span className="text-lg font-medium text-ink-soft">credits</span>
            </p>
          )}
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet/15 text-violet-bright">
          <Sparkle size={26} weight="fill" />
        </div>
      </Card>

      {/* Referral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift size={18} weight="fill" className="text-violet-bright" /> Refer a friend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[13.5px] text-ink-soft">
            Share your code. You both get <span className="font-semibold text-ink">{ref?.reward ?? 50} credits</span> when they sign up.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <code className="rounded-xl border border-line-strong bg-bg px-4 py-2.5 font-mono text-[15px] font-semibold tracking-wider text-ink">
              {ref?.code ?? "—"}
            </code>
            <button
              onClick={copy}
              disabled={!ref?.code}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-bg-raised px-4 py-2.5 text-[13px] font-semibold text-ink hover:border-violet/40 disabled:opacity-50"
            >
              {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          {(ref?.referredCount || ref?.creditsEarned) ? (
            <p className="mt-3 text-[12px] text-ink-faint">
              {ref?.referredCount ?? 0} joined · {ref?.creditsEarned ?? 0} credits earned
            </p>
          ) : null}
        </CardContent>
      </Card>
      </div>

      {/* Plans */}
      <div className="grid gap-4 sm:grid-cols-3">
        {PLANS.map((p) => (
          <Card
            key={p.name}
            className={cn("flex flex-col p-5", p.highlight && "border-violet/40 bg-violet/[0.06]")}
          >
            <p className="text-[13px] font-semibold text-ink-soft">{p.name}</p>
            <p className="mt-1 font-display text-2xl font-bold text-ink">
              {p.price} <span className="text-[13px] font-medium text-ink-faint">{p.period}</span>
            </p>
            <ul className="mt-4 flex-1 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2 text-[12.5px] text-ink-soft">
                  <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-violet-bright" /> {f}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-center text-[12px] text-ink-faint">
        Manage purchases and top-ups from the checkout that opens when you run low.
      </p>
    </div>
  );
}
