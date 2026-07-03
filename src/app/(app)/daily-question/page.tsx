"use client";

import { useEffect, useState } from "react";
import { Flame, CircleNotch, PaperPlaneTilt } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/misc";
import AnswerFeedback, { type Feedback } from "@/components/app/Feedback";
import { api } from "@/lib/api";

type Today = { question?: string; category?: string; difficulty?: string };
type Answer = { userAnswer?: string; feedback?: Feedback; answered?: boolean };
type Streak = { currentStreak?: number; longestStreak?: number };

export default function DailyQuestionPage() {
  const [today, setToday] = useState<Today | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api("/v1/daily-question/today").then((r) => setToday(r as Today)).catch(() => setToday({}));
    api("/v1/daily-question/today/my-answer").then((r) => {
      const a = r as Answer;
      if (a && a.answered !== false && (a.userAnswer || a.feedback)) setAnswer(a);
    }).catch(() => {});
    api("/v1/daily-question/streak").then((r) => setStreak(r as Streak)).catch(() => {});
  }, []);

  const submit = async () => {
    if (draft.trim().length < 10) return;
    setSubmitting(true);
    try {
      const a = (await api("/v1/daily-question/today/answer", { method: "POST", body: { userAnswer: draft.trim() } })) as Answer;
      setAnswer({ ...a, userAnswer: draft.trim() });
      api("/v1/daily-question/streak").then((r) => setStreak(r as Streak)).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Daily Question"
        subtitle="One sharp question a day. Consistency compounds."
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-[13px] font-semibold text-amber-300">
            <Flame size={15} weight="fill" /> {streak?.currentStreak ?? 0} day streak
          </span>
        }
      />

      <Card className="p-6">
        {today === null ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : (
          <>
            {(today.category || today.difficulty) && (
              <p className="mb-2 text-[11px] font-semibold tracking-widest text-violet-bright uppercase">
                {[today.category, today.difficulty].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="font-display text-xl font-semibold leading-snug text-ink">{today.question}</p>
          </>
        )}
      </Card>

      {answer ? (
        <div className="mt-5 space-y-5">
          {answer.userAnswer && (
            <Card className="p-6">
              <p className="mb-2 text-[12px] font-semibold tracking-wide text-ink-faint uppercase">Your answer</p>
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink/90">{answer.userAnswer}</p>
            </Card>
          )}
          {answer.feedback && (
            <Card className="p-6">
              <p className="mb-3 text-[12px] font-semibold tracking-wide text-ink-faint uppercase">Feedback</p>
              <AnswerFeedback feedback={answer.feedback} />
            </Card>
          )}
        </div>
      ) : (
        <Card className="mt-5 p-6">
          <Textarea
            className="min-h-40"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Answer out loud in your head first, then type your best version here…"
          />
          <Button size="lg" className="mt-4 w-full" disabled={submitting || draft.trim().length < 10} onClick={submit}>
            {submitting ? (<><CircleNotch size={17} className="animate-spin" /> Scoring…</>) : (<><PaperPlaneTilt size={16} /> Submit answer</>)}
          </Button>
        </Card>
      )}
    </div>
  );
}
