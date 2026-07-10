"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Buildings, Trash, ArrowLeft, CircleNotch, MicrophoneStage } from "@phosphor-icons/react";
import Link from "next/link";
import PageHeader from "@/components/app/PageHeader";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Skeleton, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Brief = {
  id?: string;
  _id?: string;
  company: string;
  jobRole?: string;
  overview?: string;
  culture?: string;
  interviewProcess?: string;
  commonQuestions?: string[];
  valuesAndTraits?: string[];
  whatToEmphasize?: string[];
  tipsForSuccess?: string[];
  recentNews?: string[];
  salary?: string;
  redFlags?: string[];
};
const idOf = (b: Brief) => b.id || b._id || "";

const SECTIONS: { key: keyof Brief; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "culture", label: "Culture & values" },
  { key: "interviewProcess", label: "Interview process" },
  { key: "commonQuestions", label: "Common questions" },
  { key: "valuesAndTraits", label: "What they screen for" },
  { key: "whatToEmphasize", label: "What to emphasize" },
  { key: "tipsForSuccess", label: "Tips" },
  { key: "recentNews", label: "Recent news" },
  { key: "salary", label: "Salary" },
  { key: "redFlags", label: "Red flags" },
];

function Section({ label, value }: { label: string; value: unknown }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div>
      <h3 className="mb-2 text-[12px] font-semibold tracking-widest text-ink-faint uppercase">{label}</h3>
      {Array.isArray(value) ? (
        <ul className="space-y-2">
          {value.map((v, i) => (
            <li key={i} className="flex gap-2 text-[14px] leading-relaxed text-ink/90">
              <span className="mt-0.5 shrink-0 text-violet-bright">•</span>
              {String(v)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[14px] leading-relaxed text-ink/90">{String(value)}</p>
      )}
    </div>
  );
}

export default function CompanyIntelPage() {
  const [briefs, setBriefs] = useState<Brief[] | null>(null);
  const [active, setActive] = useState<Brief | null>(null);
  const [open, setOpen] = useState(false);
  const [gen, setGen] = useState(false);
  const [company, setCompany] = useState("");
  const [jobRole, setJobRole] = useState("");

  const load = useCallback(async () => {
    try {
      const r = (await api("/v1/company-intel?limit=50")) as { briefs?: Brief[]; results?: Brief[] };
      setBriefs(r.briefs ?? r.results ?? []);
    } catch {
      setBriefs([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    setGen(true);
    try {
      const brief = (await api("/v1/company-intel/generate", {
        method: "POST",
        body: { company: company.trim(), jobRole: jobRole.trim() || undefined },
      })) as Brief;
      setOpen(false);
      setCompany("");
      setJobRole("");
      setActive(brief);
      load();
    } finally {
      setGen(false);
    }
  };

  const remove = async (b: Brief) => {
    setBriefs((prev) => prev?.filter((x) => idOf(x) !== idOf(b)) ?? null);
    if (active && idOf(active) === idOf(b)) setActive(null);
    try {
      await api(`/v1/company-intel/${idOf(b)}`, { method: "DELETE" });
    } catch {
      load();
    }
  };

  const focusFromBrief = (b: Brief) => {
    const parts = [`Run this as a realistic ${b.company} interview.`];
    if (b.interviewProcess) parts.push(`Process: ${b.interviewProcess}`);
    if (b.valuesAndTraits?.length) parts.push(`Screen for: ${b.valuesAndTraits.join("; ")}.`);
    if (b.commonQuestions?.length) parts.push(`Ask questions like: ${b.commonQuestions.slice(0, 6).join(" | ")}.`);
    return parts.join("\n").slice(0, 1600);
  };

  /* Detail view */
  if (active) {
    return (
      <div className="mx-auto ">
        <button onClick={() => setActive(null)} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink">
          <ArrowLeft size={15} /> All briefs
        </button>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet/10 text-violet-bright">
              <Buildings size={20} weight="fill" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">{active.company}</h1>
              {active.jobRole && <p className="text-sm text-ink-soft">{active.jobRole}</p>}
            </div>
          </div>
          <Link
            href={{ pathname: "/mock-interview", query: { company: active.company, role: active.jobRole || "", focus: focusFromBrief(active) } }}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <MicrophoneStage size={15} weight="fill" /> Tailored mock
          </Link>
        </div>
        <Card className="space-y-6 p-6">
          {SECTIONS.map((s) => (
            <Section key={s.key} label={s.label} value={active[s.key]} />
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Company Intel"
        subtitle="AI briefs on a company's interview loop, values, and questions."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={17} weight="bold" /> Generate brief
          </Button>
        }
      />

      {briefs === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : briefs.length === 0 ? (
        <EmptyState icon={Buildings} title="No briefs yet" description="Generate a detailed brief for any company you're interviewing with." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {briefs.map((b) => (
            <Card key={idOf(b)} className="group cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:border-violet/30" onClick={() => setActive(b)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet/10 text-violet-bright">
                    <Buildings size={17} weight="fill" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink">{b.company}</p>
                    <p className="truncate text-[11px] text-ink-faint">{b.jobRole}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(b);
                  }}
                  aria-label="Delete"
                  className="p-1.5 text-ink-faint opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                >
                  <Trash size={15} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => (gen ? null : setOpen(false))} title="Generate company brief">
        <form onSubmit={generate} className="space-y-4">
          <div>
            <Label htmlFor="c">Company *</Label>
            <Input id="c" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google" />
          </div>
          <div>
            <Label htmlFor="r">Target role</Label>
            <Input id="r" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="Senior Software Engineer" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={gen || !company.trim()}>
            {gen ? (
              <>
                <CircleNotch size={17} className="animate-spin" /> Researching…
              </>
            ) : (
              "Generate (3 credits)"
            )}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
