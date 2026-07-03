"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Briefcase, Trash, ArrowSquareOut } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Skeleton, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Stage =
  | "wishlist" | "applied" | "phone-screen" | "technical-interview"
  | "onsite" | "offer" | "accepted" | "rejected" | "withdrawn";

type App = {
  id?: string;
  _id?: string;
  company: string;
  jobRole: string;
  stage: Stage;
  location?: string;
  salary?: string;
  jobUrl?: string;
  nextSteps?: string;
};

const STAGES: { value: Stage; label: string; cls: string }[] = [
  { value: "wishlist", label: "Wishlist", cls: "text-ink-soft border-line-strong bg-bg-raised" },
  { value: "applied", label: "Applied", cls: "text-sky-300 border-sky-500/30 bg-sky-500/10" },
  { value: "phone-screen", label: "Phone screen", cls: "text-violet-bright border-violet/30 bg-violet/10" },
  { value: "technical-interview", label: "Technical", cls: "text-violet-bright border-violet/30 bg-violet/10" },
  { value: "onsite", label: "Onsite", cls: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  { value: "offer", label: "Offer", cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  { value: "accepted", label: "Accepted", cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  { value: "rejected", label: "Rejected", cls: "text-rose-300 border-rose-500/30 bg-rose-500/10" },
  { value: "withdrawn", label: "Withdrawn", cls: "text-ink-faint border-line-strong bg-bg-raised" },
];
const stageMeta = (s: Stage) => STAGES.find((x) => x.value === s) ?? STAGES[0];
const idOf = (a: App) => a.id || a._id || "";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<App[] | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ company: "", jobRole: "", location: "", salary: "", jobUrl: "", stage: "applied" as Stage, nextSteps: "" });

  const load = useCallback(async () => {
    try {
      const r = (await api("/v1/application-tracker?limit=100")) as { results?: App[] };
      setApps(r.results ?? []);
    } catch {
      setApps([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.jobRole.trim()) return;
    setSaving(true);
    try {
      await api("/v1/application-tracker", {
        method: "POST",
        body: {
          company: form.company.trim(),
          jobRole: form.jobRole.trim(),
          location: form.location.trim() || undefined,
          salary: form.salary.trim() || undefined,
          jobUrl: form.jobUrl.trim() || undefined,
          stage: form.stage,
          nextSteps: form.nextSteps.trim() || undefined,
        },
      });
      setOpen(false);
      setForm({ company: "", jobRole: "", location: "", salary: "", jobUrl: "", stage: "applied", nextSteps: "" });
      load();
    } finally {
      setSaving(false);
    }
  };

  const changeStage = async (app: App, stage: Stage) => {
    setApps((prev) => prev?.map((a) => (idOf(a) === idOf(app) ? { ...a, stage } : a)) ?? null);
    try {
      await api(`/v1/application-tracker/${idOf(app)}/stage`, { method: "PATCH", body: { stage } });
    } catch {
      load();
    }
  };

  const remove = async (app: App) => {
    setApps((prev) => prev?.filter((a) => idOf(a) !== idOf(app)) ?? null);
    try {
      await api(`/v1/application-tracker/${idOf(app)}`, { method: "DELETE" });
    } catch {
      load();
    }
  };

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Track every role and where it stands."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={17} weight="bold" /> Add application
          </Button>
        }
      />

      {apps === null ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : apps.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Add a role you're chasing to keep your pipeline in one place."
        />
      ) : (
        <div className="space-y-3">
          {apps.map((a) => {
            const m = stageMeta(a.stage);
            return (
              <Card key={idOf(a)} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[15px] font-semibold text-ink">{a.jobRole}</p>
                    {a.jobUrl && (
                      <a href={a.jobUrl} target="_blank" rel="noopener noreferrer" className="text-ink-faint hover:text-violet-bright">
                        <ArrowSquareOut size={14} />
                      </a>
                    )}
                  </div>
                  <p className="truncate text-[13px] text-ink-soft">
                    {a.company}
                    {a.location ? ` · ${a.location}` : ""}
                    {a.salary ? ` · ${a.salary}` : ""}
                  </p>
                  {a.nextSteps && <p className="mt-1 truncate text-[12px] text-ink-faint">Next: {a.nextSteps}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={a.stage}
                    onChange={(e) => changeStage(a, e.target.value as Stage)}
                    className={cn("rounded-full border px-3 py-1.5 text-[12px] font-semibold outline-none", m.cls)}
                  >
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-bg-elevated text-ink">
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => remove(a)} aria-label="Delete" className="rounded-lg p-2 text-ink-faint hover:text-rose-400">
                    <Trash size={16} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add application">
        <form onSubmit={create} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="company">Company *</Label>
              <Input id="company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Stripe" />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input id="role" required value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} placeholder="Backend Engineer" />
            </div>
            <div>
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote" />
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="$180k" />
            </div>
          </div>
          <div>
            <Label htmlFor="url">Job link</Label>
            <Input id="url" type="url" value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} placeholder="https://…" />
          </div>
          <div>
            <Label htmlFor="stage">Stage</Label>
            <select
              id="stage"
              value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
              className="h-11 w-full rounded-xl border border-line-strong bg-bg px-4 text-[15px] text-ink outline-none focus:border-violet/60"
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="next">Next steps</Label>
            <Textarea id="next" value={form.nextSteps} onChange={(e) => setForm({ ...form, nextSteps: e.target.value })} placeholder="Recruiter call Thursday…" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={saving || !form.company.trim() || !form.jobRole.trim()}>
            {saving ? "Adding…" : "Add application"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
