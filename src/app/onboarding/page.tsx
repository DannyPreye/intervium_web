"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkle, FileText, Briefcase, User, UploadSimple, CheckCircle, Check,
  ArrowRight, ArrowLeft, CircleNotch, Warning,
} from "@phosphor-icons/react";
import { Input, Label, Textarea } from "@/components/ui/input";
import { API_BASE } from "@/lib/config";
import { session } from "@/lib/session";
import { api, unwrap } from "@/lib/api";
import { cn } from "@/lib/utils";

const STEPS = ["Welcome", "Resume", "Career goals", "Details"];

type Form = {
  targetRole: string; targetCompany: string; targetIndustry: string;
  jobTitle: string; location: string; phone: string;
  linkedIn: string; github: string; portfolio: string;
  professionalSummary: string; yearsOfExperience: string;
};
const EMPTY: Form = {
  targetRole: "", targetCompany: "", targetIndustry: "",
  jobTitle: "", location: "", phone: "",
  linkedIn: "", github: "", portfolio: "",
  professionalSummary: "", yearsOfExperience: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Guard: must be signed in; if already onboarded, skip to the app.
  useEffect(() => {
    if (!session.isAuthenticated()) {
      router.replace("/login");
      return;
    }
    api<unknown>("/v1/user/me")
      .then((r) => {
        if (unwrap<{ isOnboarded?: boolean }>(r).isOnboarded) router.replace("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  const set = (k: keyof Form, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const next = () => { if (step < STEPS.length - 1) { setDir(1); setStep((s) => s + 1); } };
  const back = () => { if (step > 0) { setDir(-1); setStep((s) => s - 1); } };

  const pickFile = (f?: File | null) => {
    if (!f) return;
    const ok = /\.(pdf|docx?)$/i.test(f.name) || f.type === "application/pdf" || f.type.includes("wordprocessingml");
    if (ok) { setFile(f); setError(""); }
    else setError("Please upload a PDF or DOCX resume.");
  };

  const complete = async () => {
    if (!file) return;
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("resume", file);
      (Object.keys(form) as (keyof Form)[]).forEach((k) => { if (form[k].trim()) fd.append(k, form[k].trim()); });
      const res = await fetch(`${API_BASE}/v1/user/onboard`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access}` },
        body: fd,
      });
      if (!res.ok) {
        let msg = "Couldn't finish setup. Please try again.";
        try { msg = (await res.json()).message || msg; } catch {}
        throw new Error(msg);
      }
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onboarding failed.");
      setSubmitting(false);
    }
  };

  const canNext = step === 0 || step === 2 || step === 3 || (step === 1 && !!file);
  const isLast = step === STEPS.length - 1;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -50 : 50, opacity: 0 }),
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-bg px-4 py-10 text-ink">
      <div className="aura pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-[540px]">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <Image src="/mark.png" alt="Intavue" width={30} height={30} className="h-[30px] w-[30px]" />
          <span className="font-display text-[18px] font-bold tracking-[-0.02em]">Intavue</span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-bg-elevated p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-violet/30" />

          {/* Step indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={cn("grid h-8 w-8 place-items-center rounded-full border text-[12px] font-semibold transition-all",
                    i < step ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                      : i === step ? "border-violet/30 bg-violet/15 text-violet-bright"
                      : "border-line-strong bg-bg-raised text-ink-faint")}>
                    {i < step ? <Check size={14} weight="bold" /> : i + 1}
                  </div>
                  <span className={cn("text-[9px] font-medium", i === step ? "text-violet-bright" : "text-ink-faint")}>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={cn("mb-5 h-px w-8", i < step ? "bg-emerald-500/30" : "bg-line-strong")} />}
              </div>
            ))}
          </div>

          <div className="relative min-h-[320px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col">
                {step === 0 && (
                  <div className="flex flex-col items-center py-4 text-center">
                    <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet to-violet-deep text-white shadow-lg shadow-violet/30">
                      <Sparkle size={28} weight="fill" />
                    </div>
                    <h2 className="font-display text-xl font-bold tracking-tight">Welcome to Intavue</h2>
                    <p className="mx-auto mt-2 mb-6 max-w-sm text-sm leading-relaxed text-ink-soft">
                      Your AI interview-prep coach. Let&rsquo;s set up your profile so we can tailor every mock interview, question, and tip to you.
                    </p>
                    <div className="grid w-full max-w-sm grid-cols-3 gap-3">
                      {[{ icon: FileText, label: "Upload resume", c: "text-violet-bright" }, { icon: Briefcase, label: "Set goals", c: "text-sky-400" }, { icon: User, label: "Add details", c: "text-emerald-400" }].map((x) => (
                        <div key={x.label} className="flex flex-col items-center gap-2 rounded-xl border border-line bg-bg-raised p-3">
                          <x.icon size={17} className={x.c} weight="bold" />
                          <span className="text-center text-[10px] text-ink-soft">{x.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-tight">Upload your resume</h2>
                    <p className="mt-1 mb-5 text-[12.5px] text-ink-soft">Our AI reads it to auto-fill your profile. This is the only required step.</p>
                    <label
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files?.[0]); }}
                      className="block cursor-pointer"
                    >
                      <div className={cn("rounded-2xl border-2 border-dashed p-10 text-center transition-all",
                        dragOver ? "border-violet/50 bg-violet/[0.06]" : file ? "border-emerald-500/40 bg-emerald-500/[0.05]" : "border-line-strong hover:border-violet/40 hover:bg-white/[0.03]")}>
                        {file ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="grid h-11 w-11 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/15"><CheckCircle size={22} weight="fill" className="text-emerald-400" /></div>
                            <p className="text-sm font-medium text-ink">{file.name}</p>
                            <p className="text-[10px] text-ink-faint">{(file.size / 1024 / 1024).toFixed(2)} MB — click to change</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-bg-raised"><UploadSimple size={22} className="text-ink-faint" /></div>
                            <p className="text-sm text-ink-soft">Drop your resume here, or click to browse</p>
                            <p className="text-[10px] text-ink-faint">PDF or DOCX, max 10MB</p>
                          </div>
                        )}
                      </div>
                      <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
                    </label>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-tight">Career goals</h2>
                    <p className="mt-1 mb-5 text-[12.5px] text-ink-soft">What are you aiming for? All optional — it helps us tailor your prep.</p>
                    <div className="space-y-4">
                      <div><Label>Target role</Label><Input value={form.targetRole} onChange={(e) => set("targetRole", e.target.value)} placeholder="e.g. Senior Frontend Engineer" /></div>
                      <div><Label>Target company</Label><Input value={form.targetCompany} onChange={(e) => set("targetCompany", e.target.value)} placeholder="e.g. Google, Stripe, a startup" /></div>
                      <div><Label>Target industry</Label><Input value={form.targetIndustry} onChange={(e) => set("targetIndustry", e.target.value)} placeholder="e.g. Fintech, Healthcare, SaaS" /></div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="font-display text-lg font-bold tracking-tight">A few details</h2>
                    <p className="mt-1 mb-5 text-[12.5px] text-ink-soft">All optional — the AI extracts most of this from your resume.</p>
                    <div className="max-h-[300px] space-y-4 overflow-y-auto pr-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Job title</Label><Input value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="Current title" /></div>
                        <div><Label>Location</Label><Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" /></div>
                        <div><Label>Phone</Label><Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" /></div>
                        <div><Label>Years of experience</Label><Input type="number" min={0} value={form.yearsOfExperience} onChange={(e) => set("yearsOfExperience", e.target.value)} placeholder="e.g. 5" /></div>
                      </div>
                      <div><Label>LinkedIn URL</Label><Input type="url" value={form.linkedIn} onChange={(e) => set("linkedIn", e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>GitHub URL</Label><Input type="url" value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="https://github.com/…" /></div>
                        <div><Label>Portfolio URL</Label><Input type="url" value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} placeholder="https://yoursite.com" /></div>
                      </div>
                      <div><Label>Professional summary</Label><Textarea rows={3} value={form.professionalSummary} onChange={(e) => set("professionalSummary", e.target.value)} placeholder="A brief summary of your background…" /></div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {error && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-300">
              <Warning size={15} weight="fill" className="shrink-0" /> {error}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between">
            <div>
              {step > 0 && (
                <button onClick={back} disabled={submitting} className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-[13px] font-medium text-ink-soft transition-all hover:border-line-strong hover:text-ink disabled:opacity-50">
                  <ArrowLeft size={14} weight="bold" /> Back
                </button>
              )}
            </div>
            <button
              onClick={isLast ? complete : next}
              disabled={!canNext || submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--cta)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-12px_rgba(107,74,240,0.9)] transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? <CircleNotch size={16} className="animate-spin" />
                : isLast ? <>Complete setup <Check size={16} weight="bold" /></>
                : step === 0 ? <>Get started <ArrowRight size={16} weight="bold" /></>
                : <>Next <ArrowRight size={16} weight="bold" /></>}
            </button>
          </div>
        </div>

        {step === 1 && !file && (
          <p className="mt-4 text-center text-[11px] text-ink-faint">Don&rsquo;t have it handy? You can grab your resume as a PDF from LinkedIn → Profile → Resources → Save to PDF.</p>
        )}
      </motion.div>
    </div>
  );
}
