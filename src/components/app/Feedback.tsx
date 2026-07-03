import { CheckCircle, ArrowUpRight, Star } from "@phosphor-icons/react";

export type Feedback = {
  score?: number;
  strengths?: string[];
  improvements?: string[];
  idealAnswer?: string;
  modelAnswer?: string;
  overallFeedback?: string;
  summary?: string;
};

const scoreColor = (s: number) =>
  s >= 8 ? "text-emerald-400" : s >= 6 ? "text-amber-400" : "text-rose-400";

/** Renders scored answer feedback (shared by Daily Question + Interview Prep). */
export default function AnswerFeedback({ feedback }: { feedback: Feedback }) {
  const summary = feedback.overallFeedback || feedback.summary;
  const model = feedback.idealAnswer || feedback.modelAnswer;
  return (
    <div className="space-y-4">
      {typeof feedback.score === "number" && (
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1">
            <span className={`font-display text-3xl font-bold ${scoreColor(feedback.score)}`}>{feedback.score}</span>
            <span className="text-sm text-ink-faint">/10</span>
          </div>
          {summary && <p className="text-[13.5px] leading-relaxed text-ink-soft">{summary}</p>}
        </div>
      )}
      {!feedback.score && summary && <p className="text-[13.5px] leading-relaxed text-ink-soft">{summary}</p>}

      {feedback.strengths && feedback.strengths.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-emerald-400 uppercase">
            <CheckCircle size={13} weight="fill" /> Strengths
          </p>
          <ul className="space-y-1.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink/90">
                <span className="mt-0.5 shrink-0 text-emerald-400/70">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.improvements && feedback.improvements.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-amber-400 uppercase">
            <ArrowUpRight size={13} weight="bold" /> To improve
          </p>
          <ul className="space-y-1.5">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink/90">
                <span className="mt-0.5 shrink-0 text-amber-400/70">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {model && (
        <div className="rounded-xl border border-violet/20 bg-violet/[0.06] p-4">
          <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-violet-bright uppercase">
            <Star size={13} weight="fill" /> A strong answer
          </p>
          <p className="text-[13.5px] leading-relaxed text-ink/90">{model}</p>
        </div>
      )}
    </div>
  );
}
