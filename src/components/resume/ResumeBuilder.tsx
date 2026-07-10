"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Palette, DownloadSimple, X, CircleNotch } from "@phosphor-icons/react";
import type { GeneratedResume } from "./types";
import { getResumeById } from "./useResumeBuilder";
import { session } from "@/lib/session";
import EditorPanel from "./builder/EditorPanel";
import PreviewPanel from "./builder/PreviewPanel";
import ControlSidebar from "./builder/ControlSidebar";

/* Types shared with the templates (which import `StyleConfig`/`TemplateId`
 * from '../ResumeBuilder', matching the desktop layout). */
export type TemplateId = "modern" | "executive" | "creative" | "technical" | "elegant" | "minimal" | "sharp";
export type FontSize = "small" | "medium" | "large";
export interface StyleConfig {
  primaryColor: string;
  secondaryColor: string;
  headingFont: string;
  bodyFont: string;
  fontSize: FontSize;
  sectionSpacing: number;
}

export default function ResumeBuilder({ resumeId, onBack }: { resumeId: string; onBack: () => void }) {
  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getResumeById(resumeId)
      .then((r) => { if (alive) setResume(r); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [resumeId]);

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center text-ink-soft">
        <span className="flex items-center gap-2 text-sm"><CircleNotch size={18} className="animate-spin" /> Fetching your tailored resume…</span>
      </div>
    );
  }
  if (!resume) {
    return (
      <div className="grid h-[60vh] place-items-center text-center">
        <div>
          <p className="text-sm text-ink-soft">Couldn&apos;t load this resume.</p>
          <button onClick={onBack} className="mt-3 text-[13px] font-semibold text-violet-bright hover:underline">← Back</button>
        </div>
      </div>
    );
  }

  return <ResumeEditor key={resumeId} initial={resume} onBack={onBack} />;
}

function ResumeEditor({ initial, onBack }: { initial: GeneratedResume; onBack: () => void }) {
  const [resume, setResume] = useState<GeneratedResume>(initial);
  const [template, setTemplate] = useState<TemplateId>("modern");
  const [collapsed, setCollapsed] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [style, setStyle] = useState<StyleConfig>({
    primaryColor: "#6366f1",
    secondaryColor: "#475569",
    headingFont: "Inter",
    bodyFont: "Inter",
    fontSize: "medium",
    sectionSpacing: 1.5,
  });

  // Dynamically load the chosen Google Fonts so the preview + PDF match.
  useEffect(() => {
    const fonts = new Set([style.headingFont, style.bodyFont]);
    const id = "resume-google-fonts";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    const q = Array.from(fonts).map((f) => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800;900`).join("&");
    link.href = `https://fonts.googleapis.com/css2?${q}&display=swap`;
  }, [style.headingFont, style.bodyFont]);

  const [exporting, setExporting] = useState(false);

  // Primary path: server-side headless Chromium renders the /resume/[id]/print
  // route into a pixel-perfect, ATS-readable PDF and streams it back to download.
  // Fallback: if that endpoint errors (cold start, misconfig), open the print
  // route and let the browser print it — a zero-dependency path so export never
  // hard-fails.
  const exportPdf = async () => {
    if (!resume._id || exporting) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/resume/${resume._id}/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access ?? ""}`,
        },
        body: JSON.stringify({ template, style }),
      });
      if (!res.ok) {
        // Log the server-side reason so a failing endpoint isn't silently
        // masked by the fallback (check the browser console / Vercel logs).
        const detail = await res.text().catch(() => "");
        console.error(`PDF endpoint failed (${res.status}):`, detail);
        throw new Error("pdf endpoint failed");
      }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${(resume.personalInfo?.name || "resume").trim().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch {
      const p = new URLSearchParams({
        template,
        hf: style.headingFont,
        bf: style.bodyFont,
        fs: style.fontSize,
        pc: style.primaryColor,
        sc: style.secondaryColor,
        ss: String(style.sectionSpacing),
        autoprint: "1",
      });
      window.open(`/resume/${resume._id}/print?${p.toString()}`, "_blank", "noopener");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-2xl border border-line">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-bg-elevated px-4 py-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] font-semibold text-violet-bright hover:text-violet">
          <ArrowLeft size={14} weight="bold" /> Back to analysis
        </button>
        <h2 className="hidden text-[12px] font-bold tracking-widest text-ink uppercase sm:block">Resume Builder</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setStyleOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:bg-white/[0.04] hover:text-ink">
            <Palette size={15} /> Design
          </button>
          <button onClick={exportPdf} disabled={exporting} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cta)] px-4 py-2 text-[12.5px] font-semibold text-white hover:brightness-110 disabled:opacity-60">
            {exporting ? <CircleNotch size={15} className="animate-spin" /> : <DownloadSimple size={15} weight="bold" />} {exporting ? "Preparing…" : "Export PDF"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: collapsed ? 76 : 460 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="z-10 shrink-0 overflow-y-auto border-r border-line bg-bg-elevated/40"
        >
          <EditorPanel resume={resume} onUpdate={setResume} isCollapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        </motion.div>

        <div className="flex flex-1 items-start justify-center overflow-auto bg-black/20 p-6 lg:p-10">
          <div className="resume-scale origin-top scale-[0.62] transition-transform sm:scale-[0.72] xl:scale-[0.85] 2xl:scale-95 print:!scale-100">
            <PreviewPanel resume={resume} templateId={template} style={style} />
          </div>
        </div>

        <AnimatePresence>
          {styleOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStyleOpen(false)} className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm" />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="absolute top-0 right-0 z-50 flex h-full w-[360px] max-w-[85vw] flex-col border-l border-line-strong bg-bg-elevated shadow-2xl shadow-black/60"
              >
                <div className="flex items-center justify-between border-b border-line px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-violet/20 bg-violet/10 text-violet-bright"><Palette size={18} /></span>
                    <div>
                      <h2 className="font-display text-base font-bold text-ink">Design System</h2>
                      <p className="text-[10px] font-bold tracking-widest text-ink-faint uppercase">Customize your brand</p>
                    </div>
                  </div>
                  <button onClick={() => setStyleOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-ink-faint hover:bg-white/[0.05] hover:text-ink"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <ControlSidebar selectedTemplate={template} onTemplateChange={setTemplate} styleConfig={style} onStyleChange={setStyle} />
                </div>
                <div className="border-t border-line p-6">
                  <button onClick={exportPdf} disabled={exporting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--cta)] py-3.5 font-bold text-white hover:brightness-110 disabled:opacity-60">
                    {exporting ? <CircleNotch size={18} className="animate-spin" /> : <DownloadSimple size={18} weight="bold" />} {exporting ? "Preparing PDF…" : "Export Final PDF"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
