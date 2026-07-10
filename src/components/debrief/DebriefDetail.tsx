"use client";

import { useState } from "react";
import {
  ArrowLeft, Sparkle, Plus, CircleNotch, Star, CheckCircle, TrendUp, Warning, Lightbulb, Trophy,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { api, unwrap } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-dialog";

export type DebriefQuestion = { question: string; myAnswer?: string; wentWell?: boolean; notes?: string };
export type DebriefAnalysis = {
  overallScore?: number;
  strengths?: string[];
  areasToImprove?: string[];
  nextRoundTips?: string[];
  summary?: string;
};
export type Debrief = {
  id?: string;
  _id?: string;
  company: string;
  jobRole: string;
  interviewType: string;
  interviewDate?: string;
  overallFeeling?: number;
  whatWentWell?: string;
  whatWentPoorly?: string;
  questions?: DebriefQuestion[];
  analysis?: DebriefAnalysis;
} & DebriefAnalysis;

export const idOf = (d: Debrief) => d.id || d._id || "";

function List({ icon: Icon, color, title, items }: { icon: React.ElementType; color: string; title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className={cn("mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase", color)}>
        <Icon size={13} weight="bold" /> {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((s, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink/90">
            <span className="mt-0.5 shrink-0 opacity-50">•</span> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DebriefDetail({
  debrief,
  onBack,
  onChanged,
}: {
  debrief: Debrief;
  onBack: () => void;
  onChanged: (d: Debrief) => void;
}) {
  const [d, setD] = useState<Debrief>(debrief);
  const [qForm, setQForm] = useState<DebriefQuestion>({ question: "", myAnswer: "", wentWell: true, notes: "" });
  const [addingQ, setAddingQ] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DebriefAnalysis | null>(
    debrief.analysis ?? (debrief.overallScore != null || debrief.strengths ? debrief : null)
  );
  const id = idOf(d);

  const addQuestion = async () => {
    if (!qForm.question.trim() || addingQ) return;
    setAddingQ(true);
    try {
      const updated = unwrap<Debrief>(
        await api(`/v1/interview-debrief/${id}/questions`, { method: "POST", body: qForm })
      );
      setD(updated);
      onChanged(updated);
      setQForm({ question: "", myAnswer: "", wentWell: true, notes: "" });
    } finally {
      setAddingQ(false);
    }
  };

  const confirm = useConfirm();
  const analyze = async () => {
    if (analyzing) return;
    if (!(await confirm({
      title: "Analyze this debrief?",
      description: "AI will review this debrief and suggest coaching tips. This uses 3 credits.",
      confirmText: "Analyze · 3 credits",
    }))) return;
    setAnalyzing(true);
    try {
      const res = unwrap<Debrief>(await api(`/v1/interview-debrief/${id}/analyze`, { method: "POST" }));
      const a = (res.analysis ?? res) as DebriefAnalysis;
      setAnalysis(a);
      setD((prev) => ({ ...prev, ...res }));
      onChanged({ ...d, ...res });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onBack} className="mb-5 flex items-center gap-1.5 text-[12px] font-semibold text-violet-bright hover:text-violet">
        <ArrowLeft size={14} weight="bold" /> Back to debriefs
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">{d.jobRole} · {d.company}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-ink-soft">
            <span className="rounded-full border border-violet/25 bg-violet/10 px-2.5 py-0.5 font-medium text-violet-bright capitalize">{d.interviewType}</span>
            {d.interviewDate && <span>{new Date(d.interviewDate).toLocaleDateString()}</span>}
            {typeof d.overallFeeling === "number" && (
              <span className="flex items-center gap-0.5 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} weight={i < (d.overallFeeling ?? 0) ? "fill" : "regular"} />
                ))}
              </span>
            )}
          </div>
        </div>
        <Button size="sm" onClick={analyze} disabled={analyzing}>
          {analyzing ? <><CircleNotch size={15} className="animate-spin" /> Analyzing…</> : <><Sparkle size={15} weight="fill" /> AI analysis (3)</>}
        </Button>
      </div>

      {(d.whatWentWell || d.whatWentPoorly) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {d.whatWentWell && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
              <p className="mb-1 text-[11px] font-semibold text-emerald-400 uppercase">Went well</p>
              <p className="text-[13px] leading-relaxed text-ink/90">{d.whatWentWell}</p>
            </div>
          )}
          {d.whatWentPoorly && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
              <p className="mb-1 text-[11px] font-semibold text-amber-400 uppercase">To improve</p>
              <p className="text-[13px] leading-relaxed text-ink/90">{d.whatWentPoorly}</p>
            </div>
          )}
        </div>
      )}

      {/* AI analysis */}
      {analysis && (analysis.overallScore != null || analysis.strengths?.length || analysis.areasToImprove?.length || analysis.nextRoundTips?.length || analysis.summary) && (
        <Card className="mb-6 border-violet/20 bg-violet/[0.05] p-6">
          <p className="mb-4 flex items-center gap-2 text-[12px] font-bold tracking-widest text-violet-bright uppercase">
            <Sparkle size={14} weight="fill" /> AI analysis
          </p>
          {analysis.overallScore != null && (
            <div className="mb-4 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-violet-bright">{analysis.overallScore}</span>
              <span className="text-ink-faint">/10</span>
            </div>
          )}
          <div className="space-y-5">
            <List icon={CheckCircle} color="text-emerald-400" title="Strengths" items={analysis.strengths} />
            <List icon={TrendUp} color="text-amber-400" title="Areas to improve" items={analysis.areasToImprove} />
            <List icon={Lightbulb} color="text-sky-400" title="Tips for next round" items={analysis.nextRoundTips} />
          </div>
          {analysis.summary && <p className="mt-4 text-[13px] italic leading-relaxed text-ink-soft">{analysis.summary}</p>}
        </Card>
      )}

      {/* Questions */}
      <h3 className="mb-3 text-[13px] font-semibold text-ink">Questions asked ({d.questions?.length ?? 0})</h3>
      <div className="mb-5 space-y-3">
        {(d.questions ?? []).map((q, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-2.5">
              <span className={cn("mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", q.wentWell ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400")}>
                {q.wentWell ? "Good" : "Weak"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-ink">{q.question}</p>
                {q.myAnswer && <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{q.myAnswer}</p>}
                {q.notes && <p className="mt-1 text-[11.5px] italic text-ink-faint">{q.notes}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add question */}
      <Card className="p-5">
        <h4 className="mb-3 text-[12px] font-semibold text-ink-soft">Add a question</h4>
        <div className="space-y-3">
          <div>
            <Label htmlFor="q">Question</Label>
            <Input id="q" value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} placeholder="What were you asked?" />
          </div>
          <div>
            <Label htmlFor="a">Your answer</Label>
            <Textarea id="a" value={qForm.myAnswer} onChange={(e) => setQForm({ ...qForm, myAnswer: e.target.value })} placeholder="How did you answer?" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-line-strong bg-bg-raised p-0.5">
              <button type="button" onClick={() => setQForm({ ...qForm, wentWell: true })} className={cn("rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all", qForm.wentWell ? "bg-emerald-500/15 text-emerald-400" : "text-ink-faint")}>Went well</button>
              <button type="button" onClick={() => setQForm({ ...qForm, wentWell: false })} className={cn("rounded-md px-3 py-1.5 text-[12px] font-semibold transition-all", !qForm.wentWell ? "bg-rose-500/15 text-rose-400" : "text-ink-faint")}>Struggled</button>
            </div>
            <Input value={qForm.notes} onChange={(e) => setQForm({ ...qForm, notes: e.target.value })} placeholder="Notes (optional)" className="h-10 flex-1" />
          </div>
          <Button size="sm" onClick={addQuestion} disabled={addingQ || !qForm.question.trim()}>
            {addingQ ? <><CircleNotch size={15} className="animate-spin" /> Adding…</> : <><Plus size={15} weight="bold" /> Add question</>}
          </Button>
        </div>
      </Card>

      {(d.questions?.length ?? 0) === 0 && !analysis && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-faint">
          <Trophy size={12} weight="fill" /> Add the questions you were asked, then run AI analysis for improved answers + coaching.
        </p>
      )}
    </div>
  );
}
