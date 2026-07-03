"use client";

import { useCallback, useEffect, useState } from "react";
import { ChartLineUp, Trash, Star } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { TwoPane } from "@/components/app/Panels";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Skeleton, EmptyState } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type IType = "phone-screen" | "technical" | "behavioral" | "system-design" | "hiring-manager" | "panel" | "take-home" | "other";
type Debrief = {
  id?: string;
  _id?: string;
  company: string;
  jobRole: string;
  interviewType: IType;
  interviewDate?: string;
  overallFeeling?: number;
  whatWentWell?: string;
  whatWentPoorly?: string;
};
const idOf = (d: Debrief) => d.id || d._id || "";

const ITYPES: { value: IType; label: string }[] = [
  { value: "phone-screen", label: "Phone screen" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "system-design", label: "System design" },
  { value: "hiring-manager", label: "Hiring manager" },
  { value: "panel", label: "Panel" },
  { value: "take-home", label: "Take-home" },
  { value: "other", label: "Other" },
];
const typeLabel = (t: IType) => ITYPES.find((x) => x.value === t)?.label ?? t;
const today = () => new Date().toISOString().slice(0, 10);

export default function DebriefPage() {
  const [items, setItems] = useState<Debrief[] | null>(null);
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
      const r = (await api("/v1/interview-debrief?limit=50")) as { results?: Debrief[] };
      setItems(r.results ?? []);
    } catch {
      setItems([]);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.jobRole.trim()) return;
    setSaving(true);
    try {
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
      });
      setForm({ ...form, company: "", jobRole: "", whatWentWell: "", whatWentPoorly: "", overallFeeling: 3 });
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d: Debrief) => {
    setItems((prev) => prev?.filter((x) => idOf(x) !== idOf(d)) ?? null);
    try { await api(`/v1/interview-debrief/${idOf(d)}`, { method: "DELETE" }); } catch { load(); }
  };

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
      <PageHeader title="Debrief" subtitle="Log real interviews. Reviewing them is where the improvement lives." />
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
              <Card key={idOf(d)} className="p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-semibold text-ink">{d.jobRole} · {d.company}</p>
                    <p className="text-[12px] text-ink-faint">
                      {typeLabel(d.interviewType)}
                      {d.interviewDate ? ` · ${d.interviewDate.slice(0, 10)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof d.overallFeeling === "number" && (
                      <span className="flex items-center gap-0.5 text-amber-300">
                        <Star size={13} weight="fill" /> {d.overallFeeling}/5
                      </span>
                    )}
                    <button onClick={() => remove(d)} aria-label="Delete" className="p-1.5 text-ink-faint hover:text-rose-400">
                      <Trash size={15} />
                    </button>
                  </div>
                </div>
                {(d.whatWentWell || d.whatWentPoorly) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {d.whatWentWell && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                        <p className="mb-1 text-[11px] font-semibold text-emerald-400 uppercase">Went well</p>
                        <p className="text-[13px] leading-relaxed text-ink/90">{d.whatWentWell}</p>
                      </div>
                    )}
                    {d.whatWentPoorly && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3">
                        <p className="mb-1 text-[11px] font-semibold text-amber-400 uppercase">To improve</p>
                        <p className="text-[13px] leading-relaxed text-ink/90">{d.whatWentPoorly}</p>
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
