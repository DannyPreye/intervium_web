"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleNotch, Copy, Check, Trash, ChatTeardropText } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { TwoPane } from "@/components/app/Panels";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type ContentType = "cover-letter" | "linkedin-message" | "cold-email" | "follow-up-email" | "thank-you-email";
type Tone = "professional" | "friendly" | "confident" | "casual";
type Content = {
  id?: string;
  _id?: string;
  type: ContentType;
  company?: string;
  jobRole?: string;
  content?: string;
  body?: string;
  text?: string;
};
const idOf = (c: Content) => c.id || c._id || "";
const bodyOf = (c: Content) => c.content || c.body || c.text || "";

const TYPES: { value: ContentType; label: string }[] = [
  { value: "cover-letter", label: "Cover letter" },
  { value: "cold-email", label: "Cold email" },
  { value: "linkedin-message", label: "LinkedIn" },
  { value: "follow-up-email", label: "Follow-up" },
  { value: "thank-you-email", label: "Thank-you" },
];
const TONES: Tone[] = ["professional", "friendly", "confident", "casual"];
const typeLabel = (t: ContentType) => TYPES.find((x) => x.value === t)?.label ?? t;

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })}
      className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-bg-raised px-3 py-1.5 text-[12px] font-semibold text-ink hover:border-violet/40"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function CoverLettersPage() {
  const [type, setType] = useState<ContentType>("cover-letter");
  const [tone, setTone] = useState<Tone>("professional");
  const [company, setCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [gen, setGen] = useState(false);
  const [result, setResult] = useState<Content | null>(null);
  const [history, setHistory] = useState<Content[]>([]);

  const load = useCallback(async () => {
    try {
      const r = (await api("/v1/cover-letter?limit=20")) as { results?: Content[] };
      setHistory(r.results ?? []);
    } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGen(true);
    try {
      const c = (await api("/v1/cover-letter/generate", {
        method: "POST",
        body: {
          type,
          tone,
          company: company.trim() || undefined,
          jobRole: jobRole.trim() || undefined,
          jobDescription: jobDescription.trim() || undefined,
        },
      })) as Content;
      setResult(c);
      load();
    } finally {
      setGen(false);
    }
  };

  const remove = async (c: Content) => {
    setHistory((prev) => prev.filter((x) => idOf(x) !== idOf(c)));
    if (result && idOf(result) === idOf(c)) setResult(null);
    try { await api(`/v1/cover-letter/${idOf(c)}`, { method: "DELETE" }); } catch { load(); }
  };

  const form = (
    <Card className="p-6">
      <form onSubmit={generate} className="space-y-4">
        <div>
          <Label>Type</Label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-all", type === t.value ? "border-violet/50 bg-violet/15 text-ink" : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink")}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="c">Company</Label>
          <Input id="c" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Stripe" />
        </div>
        <div>
          <Label htmlFor="r">Role</Label>
          <Input id="r" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="Backend Engineer" />
        </div>
        <div>
          <Label htmlFor="jd">Job description</Label>
          <Textarea id="jd" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the posting for a sharper result…" />
        </div>
        <div>
          <Label>Tone</Label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button key={t} type="button" onClick={() => setTone(t)}
                className={cn("rounded-full border px-3 py-1.5 text-[12.5px] font-medium capitalize transition-all", tone === t ? "border-violet/50 bg-violet/15 text-ink" : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink")}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={gen}>
          {gen ? (<><CircleNotch size={17} className="animate-spin" /> Writing…</>) : "Generate (5 credits)"}
        </Button>
      </form>
    </Card>
  );

  return (
    <div>
      <PageHeader title="Cover Letters & Outreach" subtitle="Tailored to the job, in your voice." />
      <TwoPane aside={form} wide>
        {result ? (
          <Card className="p-6 lg:p-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink-soft">{typeLabel(result.type)}{result.company ? ` · ${result.company}` : ""}</p>
              <CopyBtn text={bodyOf(result)} />
            </div>
            <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink/90">{bodyOf(result)}</p>
          </Card>
        ) : (
          <Card className="grid min-h-[320px] place-items-center">
            <EmptyState icon={ChatTeardropText} title="Your draft appears here" description="Fill the details on the left and generate. You can copy it or tweak the inputs and regenerate." />
          </Card>
        )}

        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-[13px] font-semibold tracking-wide text-ink-faint uppercase">History</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {history.map((c) => (
                <Card key={idOf(c)} className="flex items-center justify-between gap-3 p-4">
                  <button onClick={() => setResult(c)} className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[13.5px] font-medium text-ink">
                      {typeLabel(c.type)}{c.company ? ` · ${c.company}` : ""}
                    </p>
                    <p className="truncate text-[12px] text-ink-faint">{bodyOf(c).slice(0, 70)}</p>
                  </button>
                  <button onClick={() => remove(c)} aria-label="Delete" className="shrink-0 p-1.5 text-ink-faint hover:text-rose-400">
                    <Trash size={15} />
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </TwoPane>
    </div>
  );
}
