"use client";

import { useState } from "react";
import { Brain, CircleNotch, ArrowClockwise, PaperPlaneTilt } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { TwoPane } from "@/components/app/Panels";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/misc";
import AnswerFeedback, { type Feedback } from "@/components/app/Feedback";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Category = "behavioral" | "technical" | "system-design" | "coding" | "culture-fit" | "problem-solving";
type Difficulty = "junior" | "mid" | "senior" | "staff";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "system-design", label: "System design" },
  { value: "coding", label: "Coding" },
  { value: "problem-solving", label: "Problem solving" },
  { value: "culture-fit", label: "Culture fit" },
];
const DIFFICULTIES: Difficulty[] = ["junior", "mid", "senior", "staff"];

export default function InterviewPrepPage() {
  const [jobRole, setJobRole] = useState("");
  const [category, setCategory] = useState<Category>("behavioral");
  const [difficulty, setDifficulty] = useState<Difficulty>("mid");

  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const getQuestion = async () => {
    if (!jobRole.trim()) return;
    setLoadingQ(true);
    setFeedback(null);
    setAnswer("");
    try {
      const r = (await api("/v1/interview-prep/quick-question", {
        method: "POST",
        body: { jobRole: jobRole.trim(), category, difficulty },
      })) as string | { question?: string; text?: string };
      setQuestion(typeof r === "string" ? r : r.question || r.text || "");
    } finally {
      setLoadingQ(false);
    }
  };

  const evaluate = async () => {
    if (answer.trim().length < 10) return;
    setEvaluating(true);
    try {
      const r = (await api("/v1/interview-prep/evaluate", {
        method: "POST",
        body: { question, category, userAnswer: answer.trim(), jobRole: jobRole.trim(), difficulty },
      })) as Feedback | { feedback?: Feedback };
      setFeedback((r as { feedback?: Feedback }).feedback ?? (r as Feedback));
    } finally {
      setEvaluating(false);
    }
  };

  const config = (
    <Card className="p-6">
      <div className="space-y-5">
        <div>
          <Label htmlFor="role">Target role</Label>
          <Input id="role" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="Senior Backend Engineer" />
        </div>
        <div>
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all",
                  category === c.value ? "border-violet/50 bg-violet/15 text-ink" : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Difficulty</Label>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[13px] font-medium capitalize transition-all",
                  difficulty === d ? "border-violet/50 bg-violet/15 text-ink" : "border-line-strong bg-bg-raised text-ink-soft hover:text-ink"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <Button size="lg" className="w-full" disabled={loadingQ || !jobRole.trim()} onClick={getQuestion}>
          {loadingQ ? (
            <><CircleNotch size={17} className="animate-spin" /> Thinking…</>
          ) : question ? (
            <><ArrowClockwise size={16} /> New question</>
          ) : (
            <><Brain size={17} weight="fill" /> Get a question</>
          )}
        </Button>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader title="Interview Prep" subtitle="Get a question, answer it, get scored feedback. Repeat." />
      <TwoPane aside={config}>
        {!question ? (
          <Card className="grid min-h-[420px] place-items-center">
            <EmptyState
              icon={Brain}
              title="Pick a focus, then get a question"
              description="Set your role, category, and difficulty on the left, and a tailored question appears here to answer."
            />
          </Card>
        ) : (
          <Card className="p-6 lg:p-8">
            <p className="mb-2 text-[11px] font-semibold tracking-widest text-violet-bright uppercase">Question</p>
            <p className="font-display text-xl font-semibold leading-snug text-ink lg:text-2xl">{question}</p>

            {!feedback ? (
              <>
                <Textarea
                  className="mt-5 min-h-44"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer. Structure it like you would out loud."
                />
                <Button className="mt-3" disabled={evaluating || answer.trim().length < 10} onClick={evaluate}>
                  {evaluating ? (<><CircleNotch size={16} className="animate-spin" /> Scoring…</>) : (<><PaperPlaneTilt size={15} /> Evaluate my answer</>)}
                </Button>
              </>
            ) : (
              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold tracking-wide text-ink-faint uppercase">Your answer</p>
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">{answer}</p>
                </div>
                <div className="border-t border-line pt-6">
                  <AnswerFeedback feedback={feedback} />
                </div>
                <Button variant="secondary" onClick={getQuestion}>
                  <ArrowClockwise size={16} /> Next question
                </Button>
              </div>
            )}
          </Card>
        )}
      </TwoPane>
    </div>
  );
}
