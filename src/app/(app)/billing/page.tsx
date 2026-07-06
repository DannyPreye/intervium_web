"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkle, Gift, Copy, Check, CheckCircle, CircleNotch, ArrowSquareOut } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Status = { credits?: number; subscriptionStatus?: string; subscriptionPlan?: string; subscriptionProvider?: string };
type Referral = { code?: string; reward?: number; referredCount?: number; creditsEarned?: number };
type Plan = {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  type: "subscription" | "top-up";
  interval?: "monthly" | "yearly";
  features?: string[];
  creditsAllocation: number;
};
const idOf = (p: Plan) => p._id || p.id || "";

const usd = (n: number) =>
  n === 0 ? "Free" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export default function BillingPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [ref, setRef] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const loadStatus = useCallback(() => {
    api("/v1/billing/status")
      .then((r) => setStatus(r as Status))
      .catch(() => setStatus((s) => s ?? {}));
  }, []);

  useEffect(() => {
    loadStatus();
    api("/v1/billing/plans")
      .then((r) => setPlans((r as { results?: Plan[] }).results ?? []))
      .catch(() => setPlans([]));
    api("/v1/user/referral").then((r) => setRef(r as Referral)).catch(() => setRef({}));
    // Refresh credits when the user returns from the checkout tab.
    window.addEventListener("focus", loadStatus);
    return () => window.removeEventListener("focus", loadStatus);
  }, [loadStatus]);

  const copy = () => {
    if (!ref?.code) return;
    navigator.clipboard.writeText(ref.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const checkout = async (plan: Plan) => {
    const id = idOf(plan);
    if (!id) return;
    setBusy(id);
    try {
      const res = (await api("/v1/billing/checkout/paystack", { method: "POST", body: { planId: id } })) as { url?: string };
      if (res.url) {
        window.open(res.url, "_blank", "noopener");
        // Poll for a couple of minutes so credits update once the webhook fulfils.
        let n = 0;
        const t = setInterval(() => {
          n += 1;
          loadStatus();
          if (n >= 30) clearInterval(t);
        }, 4000);
      }
    } catch {
      /* surfaced by the global 402 handler / no-op */
    } finally {
      setBusy(null);
    }
  };

  const activePlan = (status?.subscriptionPlan && status.subscriptionPlan !== "free") ? status.subscriptionPlan : null;

  const subs = (plans ?? []).filter((p) => p.type === "subscription");
  const topups = (plans ?? []).filter((p) => p.type === "top-up");

  const PlanCard = ({ p, highlight }: { p: Plan; highlight?: boolean }) => {
    const isCurrent = activePlan && p.name.toLowerCase().includes(activePlan.toLowerCase());
    return (
      <Card className={cn("flex flex-col p-6", highlight && "border-violet/40 bg-violet/[0.06]")}>
        {highlight && (
          <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-violet/20 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-violet-bright uppercase">
            Popular
          </span>
        )}
        <p className="text-[14px] font-semibold text-ink">{p.name}</p>
        <p className="mt-1 font-display text-3xl font-bold text-ink">
          {usd(p.price)}
          {p.type === "subscription" && p.price > 0 && (
            <span className="text-[13px] font-medium text-ink-faint">/{p.interval === "yearly" ? "yr" : "mo"}</span>
          )}
        </p>
        {p.description && <p className="mt-1 text-[12.5px] text-ink-soft">{p.description}</p>}
        <p className="mt-3 text-[13px] font-medium text-violet-bright">{p.creditsAllocation.toLocaleString()} credits</p>
        {p.features && p.features.length > 0 && (
          <ul className="mt-3 flex-1 space-y-2">
            {p.features.map((f) => (
              <li key={f} className="flex gap-2 text-[12.5px] text-ink-soft">
                <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-violet-bright" /> {f}
              </li>
            ))}
          </ul>
        )}
        <Button
          className="mt-5 w-full"
          variant={highlight ? "primary" : "secondary"}
          disabled={busy === idOf(p) || !!isCurrent}
          onClick={() => checkout(p)}
        >
          {isCurrent ? "Current plan" : busy === idOf(p) ? (<><CircleNotch size={16} className="animate-spin" /> Starting…</>) : p.type === "top-up" ? "Buy credits" : "Choose plan"}
          {!isCurrent && busy !== idOf(p) && <ArrowSquareOut size={15} />}
        </Button>
      </Card>
    );
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Billing" subtitle="Credits, plans, and referrals." />

      <div className="mb-6 grid gap-5 lg:grid-cols-2">
        {/* Credit hero */}
        <Card className="flex items-center justify-between gap-4 border-violet/25 bg-gradient-to-br from-violet/[0.16] via-violet/[0.05] to-transparent p-6">
          <div>
            <p className="text-[12px] font-semibold tracking-widest text-ink-faint uppercase">Balance</p>
            {status === null ? (
              <Skeleton className="mt-2 h-9 w-28" />
            ) : (
              <p className="mt-1 font-display text-4xl font-bold text-ink">
                {status.credits ?? 0} <span className="text-lg font-medium text-ink-soft">credits</span>
              </p>
            )}
            {activePlan && <p className="mt-1 text-[12px] capitalize text-ink-soft">{activePlan} plan · {status?.subscriptionStatus ?? "active"}</p>}
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
      {plans === null ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-ink-soft">Plans aren&rsquo;t available right now. Please check back shortly.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {subs.length > 0 && (
            <div>
              <h2 className="mb-4 text-[13px] font-semibold tracking-wide text-ink-faint uppercase">Subscriptions</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subs.map((p, i) => (
                  <PlanCard key={idOf(p)} p={p} highlight={subs.length > 1 && i === Math.min(1, subs.length - 1)} />
                ))}
              </div>
            </div>
          )}
          {topups.length > 0 && (
            <div>
              <h2 className="mb-4 text-[13px] font-semibold tracking-wide text-ink-faint uppercase">Top-up packs</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topups.map((p) => (
                  <PlanCard key={idOf(p)} p={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-[12px] text-ink-faint">
        Checkout opens in a new tab. Your credits update automatically once payment is confirmed.
      </p>
    </div>
  );
}
