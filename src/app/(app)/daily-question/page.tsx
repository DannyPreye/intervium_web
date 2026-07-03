"use client";

import { useEffect, useState } from "react";
import { Flame, CircleNotch, PaperPlaneTilt } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { TwoPane } from "@/components/app/Panels";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Skeleton, EmptyState } from "@/components/ui/misc";
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

  const aside = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/15 text-amber-300">
          <Flame size={22} weight="fill" />
        </div>
        <div>
          <p className="font-display text-xl font-bold text-ink">{streak?.currentStreak ?? 0}</p>
          <p className="text-[12px] text-ink-soft">day streak · best {streak?.longestStreak ?? 0}</p>
        </div>
      </div>
      <Card className="p-6">
        {today === null ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ) : (
          <>
            {(today.category || today.difficulty) && (
              <p className="mb-2 text-[11px] font-semibold tracking-widest text-violet-bright uppercase">
                {[today.category, today.difficulty].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="font-display text-lg font-semibold leading-snug text-ink">{today.question}</p>
          </>
        )}
      </Card>
    </div>
  );

  return (
    <div>
      <PageHeader title="Daily Question" subtitle="One sharp question a day. Consistency compounds." />
      <TwoPane aside={aside}>
        {answer ? (
          <div className="space-y-5">
            {answer.userAnswer && (
              <Card className="p-6 lg:p-8">
                <p className="mb-2 text-[12px] font-semibold tracking-wide text-ink-faint uppercase">Your answer</p>
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink/90">{answer.userAnswer}</p>
              </Card>
            )}
            {answer.feedback && (
              <Card className="p-6 lg:p-8">
                <p className="mb-4 text-[12px] font-semibold tracking-wide text-ink-faint uppercase">Feedback</p>
                <AnswerFeedback feedback={answer.feedback} />
              </Card>
            )}
            {!answer.feedback && (
              <Card className="grid min-h-[240px] place-items-center">
                <EmptyState icon={Flame} title="Answered" description="You've logged today's answer. Come back tomorrow for a fresh one." />
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-6 lg:p-8">
            <p className="mb-3 text-[13px] text-ink-soft">Answer it out loud in your head first, then type your best version.</p>
            <Textarea className="min-h-56" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your answer…" />
            <Button size="lg" className="mt-4" disabled={submitting || draft.trim().length < 10} onClick={submit}>
              {submitting ? (<><CircleNotch size={17} className="animate-spin" /> Scoring…</>) : (<><PaperPlaneTilt size={16} /> Submit answer</>)}
            </Button>
          </Card>
        )}
      </TwoPane>
    </div>
  );
}
