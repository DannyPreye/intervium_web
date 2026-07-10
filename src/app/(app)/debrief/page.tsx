"use client";

import { useCallback, useEffect, useState } from "react";
import { ChartLineUp, Trash, Star, CircleNotch, ChartBar, TrendUp, Buildings, Trophy, CaretRight } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { TwoPane } from "@/components/app/Panels";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Skeleton, EmptyState } from "@/components/ui/misc";
import { api, unwrap } from "@/lib/api";
import { cn } from "@/lib/utils";
import DebriefDetail, { type Debrief, idOf } from "@/components/debrief/DebriefDetail";
import { useConfirm } from "@/components/ui/confirm-dialog";

// Matches the backend interviewType enum exactly (validation rejects others).
type IType = "phone" | "technical" | "behavioral" | "system-design" | "panel" | "final" | "other";
const ITYPES: { value: IType; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "system-design", label: "System design" },
  { value: "panel", label: "Panel" },
  { value: "final", label: "Final" },
  { value: "other", label: "Other" },
];
const typeLabel = (t: string) => ITYPES.find((x) => x.value === t)?.label ?? t;
const today = () => new Date().toISOString().slice(0, 10);

type Insights = {
  total?: number;
  avgFeeling?: number;
  companiesInterviewed?: number;
  topStrengths?: { name: string; count: number }[];
  topWeaknesses?: { name: string; count: number }[];
};

function StatCard({ icon: Icon, color, label, value, sub }: { icon: React.ElementType; color: string; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card className="p-4">
      <Icon size={18} weight="bold" className={cn("mb-2", color)} />
      <p className="font-display text-2xl font-bold text-ink">
        {value}{sub && <span className="ml-0.5 text-sm font-medium text-ink-faint">{sub}</span>}
      </p>
      <p className="mt-0.5 text-[11px] tracking-wide text-ink-faint uppercase">{label}</p>
    </Card>
  );
}

export default function DebriefPage() {
  const [items, setItems] = useState<Debrief[] | null>(null);
  const [active, setActive] = useState<Debrief | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [insightsBusy, setInsightsBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: "",
    jobRole: "",
    interviewType: "technical" as IType,
    interviewDate: today(),
    overallFeeling: 3,
    whatWentWell: "",
    whatWentPoorly: "",
  });

  const load = useCallback(async () => {
    try {
      // Backend returns { debriefs, total } (not { results }).
      const r = (await api("/v1/interview-debrief?limit=50")) as { debriefs?: Debrief[] };
      setItems(r.debriefs ?? []);
    } catch {
      setItems([]);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const confirm = useConfirm();
  const loadInsights = async () => {
    if (insightsBusy) return;
    if (!(await confirm({
      title: "Generate cross-debrief insights?",
      description: "AI will analyze all your debriefs to surface patterns and trends. This uses 3 credits.",
      confirmText: "Generate · 3 credits",
    }))) return;
    setInsightsBusy(true);
    try {
      setInsights((await api("/v1/interview-debrief/insights")) as Insights);
    } catch {
      /* surfaced by the global 402 handler */
    } finally {
      setInsightsBusy(false);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.jobRole.trim()) return;
    setSaving(true);
    try {
      const created = unwrap<Debrief>(
        await api("/v1/interview-debrief", {
          method: "POST",
          body: {
            company: form.company.trim(),
            jobRole: form.jobRole.trim(),
            interviewType: form.interviewType,
            interviewDate: form.interviewDate,
            overallFeeling: form.overallFeeling,
            whatWentWell: form.whatWentWell.trim() || undefined,
            whatWentPoorly: form.whatWentPoorly.trim() || undefined,
          },
        })
      );
      setForm({ ...form, company: "", jobRole: "", whatWentWell: "", whatWentPoorly: "", overallFeeling: 3 });
      load();
      if (idOf(created)) setActive(created); // jump into the debrief to add questions
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d: Debrief, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev?.filter((x) => idOf(x) !== idOf(d)) ?? null);
    try { await api(`/v1/interview-debrief/${idOf(d)}`, { method: "DELETE" }); } catch { load(); }
  };

  if (active) {
    return (
      <DebriefDetail
        debrief={active}
        onBack={() => { setActive(null); load(); }}
        onChanged={(d) => { setActive(d); setItems((prev) => prev?.map((x) => (idOf(x) === idOf(d) ? d : x)) ?? null); }}
      />
    );
  }

  const form_ = (
    <Card className="p-6">
      <form onSubmit={create} className="space-y-4">
        <div>
          <Label htmlFor="co">Company *</Label>
          <Input id="co" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Stripe" />
        </div>
        <div>
          <Label htmlFor="ro">Role *</Label>
          <Input id="ro" required value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} placeholder="Backend Engineer" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ty">Type</Label>
            <select id="ty" value={form.interviewType} onChange={(e) => setForm({ ...form, interviewType: e.target.value as IType })}
              className="h-11 w-full rounded-xl border border-line-strong bg-bg px-3 text-[14px] text-ink outline-none focus:border-violet/60">
              {ITYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="dt">Date</Label>
            <Input id="dt" type="date" value={form.interviewDate} onChange={(e) => setForm({ ...form, interviewDate: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>How did it feel?</Label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setForm({ ...form, overallFeeling: n })} aria-label={`${n} of 5`}
                className={cn("p-1", n <= form.overallFeeling ? "text-amber-300" : "text-ink-faint")}>
                <Star size={24} weight={n <= form.overallFeeling ? "fill" : "regular"} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="ww">What went well</Label>
          <Textarea id="ww" value={form.whatWentWell} onChange={(e) => setForm({ ...form, whatWentWell: e.target.value })} placeholder="Nailed the system-design trade-offs…" />
        </div>
        <div>
          <Label htmlFor="wp">What to improve</Label>
          <Textarea id="wp" value={form.whatWentPoorly} onChange={(e) => setForm({ ...form, whatWentPoorly: e.target.value })} placeholder="Rushed the coding question…" />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={saving || !form.company.trim() || !form.jobRole.trim()}>
          {saving ? "Saving…" : "Log debrief"}
        </Button>
      </form>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Debrief"
        subtitle="Log real interviews. Reviewing them is where the improvement lives."
        action={
          <Button variant="secondary" onClick={loadInsights} disabled={insightsBusy}>
            {insightsBusy ? <CircleNotch size={16} className="animate-spin" /> : <ChartBar size={16} weight="bold" />}
            {insights ? "Refresh insights" : "AI insights (3)"}
          </Button>
        }
      />

      {insights && (
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={ChartBar} color="text-violet-bright" label="Total debriefs" value={insights.total ?? 0} />
          <StatCard icon={TrendUp} color="text-amber-400" label="Avg feeling" value={insights.avgFeeling?.toFixed(1) ?? "—"} sub="/5" />
          <StatCard icon={Buildings} color="text-sky-400" label="Companies" value={insights.companiesInterviewed ?? 0} />
          <StatCard icon={Trophy} color="text-emerald-400" label="Top strength" value={insights.topStrengths?.[0]?.name ?? "—"} />
        </div>
      )}

      <TwoPane aside={form_} wide>
        {items === null ? (
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : items.length === 0 ? (
          <Card className="grid min-h-[320px] place-items-center">
            <EmptyState icon={ChartLineUp} title="No debriefs yet" description="After a real interview, log what was asked and how it went. Patterns show up fast." />
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((d) => (
              <Card key={idOf(d)} onClick={() => setActive(d)} className="group cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:border-violet/40">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-ink transition-colors group-hover:text-violet-bright">{d.jobRole} · {d.company}</p>
                    <p className="text-[12px] text-ink-faint">
                      {typeLabel(d.interviewType)}
                      {d.interviewDate ? ` · ${d.interviewDate.slice(0, 10)}` : ""}
                      {d.questions?.length ? ` · ${d.questions.length} question${d.questions.length > 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof d.overallFeeling === "number" && (
                      <span className="flex items-center gap-0.5 text-amber-300">
                        <Star size={13} weight="fill" /> {d.overallFeeling}/5
                      </span>
                    )}
                    <button onClick={(e) => remove(d, e)} aria-label="Delete" className="p-1.5 text-ink-faint hover:text-rose-400">
                      <Trash size={15} />
                    </button>
                    <CaretRight size={15} className="text-ink-faint transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
                {(d.whatWentWell || d.whatWentPoorly) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {d.whatWentWell && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                        <p className="mb-1 text-[11px] font-semibold text-emerald-400 uppercase">Went well</p>
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-ink/90">{d.whatWentWell}</p>
                      </div>
                    )}
                    {d.whatWentPoorly && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3">
                        <p className="mb-1 text-[11px] font-semibold text-amber-400 uppercase">To improve</p>
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-ink/90">{d.whatWentPoorly}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </TwoPane>
    </div>
  );
}
