"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileMagnifyingGlass, Plus, Trash, CalendarBlank, CaretRight } from "@phosphor-icons/react";
import PageHeader from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton, EmptyState } from "@/components/ui/misc";
import { api } from "@/lib/api";
import AnalyzeWizard from "@/components/resume/AnalyzeWizard";
import AnalysisDetail from "@/components/resume/AnalysisDetail";
import { type ResumeAnalysis, idOf, scoreColor, scoreBg } from "@/components/resume/types";

export default function ResumeAnalyzerPage() {
  const [items, setItems] = useState<ResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ResumeAnalysis | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      // Backend returns { analyses, total } (not { results }).
      const r = (await api("/v1/resume-analyzer?page=1&limit=50")) as { analyses?: ResumeAnalysis[] };
      setItems(r.analyses ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const onAnalyzed = (a: ResumeAnalysis) => {
    setWizardOpen(false);
    setItems((prev) => [a, ...prev.filter((x) => idOf(x) !== idOf(a))]);
    setActive(a); // land straight on the fresh result
  };

  const remove = async (a: ResumeAnalysis, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((x) => idOf(x) !== idOf(a)));
    try { await api(`/v1/resume-analyzer/${idOf(a)}`, { method: "DELETE" }); } catch { load(); }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnalysisDetail analysis={active} onBack={() => setActive(null)} />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PageHeader
              title="Resume Analyzer"
              subtitle="Get AI-powered ATS scoring and tailored improvement suggestions."
              action={
                <Button onClick={() => setWizardOpen(true)}>
                  <Plus size={16} weight="bold" /> Analyze Resume
                </Button>
              }
            />

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40" />)}
              </div>
            ) : items.length === 0 ? (
              <Card className="grid min-h-[380px] place-items-center">
                <EmptyState
                  icon={FileMagnifyingGlass}
                  title="No analyses yet"
                  description="Upload your resume and a job description to get ATS scoring and optimization tips."
                  action={
                    <Button onClick={() => setWizardOpen(true)}>
                      <FileMagnifyingGlass size={16} weight="bold" /> Analyze Resume
                    </Button>
                  }
                />
              </Card>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((a, i) => {
                  const score = a.atsScore ?? 0;
                  return (
                    <motion.div
                      key={idOf(a) || i}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: (i % 6) * 0.04 }}
                    >
                      <Card
                        onClick={() => setActive(a)}
                        className="group flex h-full cursor-pointer flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-violet/40"
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className={`grid h-14 w-14 place-items-center rounded-2xl border ${scoreBg(score)}`}>
                            <span className={`text-xl font-black tracking-tight ${scoreColor(score)}`}>{score}</span>
                          </div>
                          <button
                            onClick={(e) => remove(a, e)}
                            aria-label="Delete"
                            className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-[15px] font-bold text-ink transition-colors group-hover:text-violet-bright">
                            {a.company || "Resume analysis"}
                          </h4>
                          {a.jobRole && <p className="truncate text-[13px] font-medium text-ink-soft">{a.jobRole}</p>}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                          <span className="flex items-center gap-1.5 text-[11.5px] text-ink-faint">
                            <CalendarBlank size={13} />
                            {a.createdAt
                              ? new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
                              : "—"}
                          </span>
                          <span className="flex items-center gap-1 text-[11.5px] font-medium text-violet-bright">
                            Review <CaretRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnalyzeWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onSuccess={onAnalyzed} />
    </div>
  );
}
