"use client";

import { useRef, useState } from "react";
import { FileArrowUp, FileText, CheckCircle, CircleNotch, X, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { API_BASE } from "@/lib/config";
import { session } from "@/lib/session";
import type { ResumeAnalysis } from "./types";

async function analyzeRequest(fd: FormData): Promise<ResumeAnalysis> {
  // Multipart (matches the desktop app + the backend's upload.single('resume')).
  // We bypass the JSON api() wrapper so the browser sets the multipart boundary.
  const res = await fetch(`${API_BASE}/v1/resume-analyzer/analyze`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access}` },
    body: fd,
  });
  if (!res.ok) {
    let msg = "Couldn't analyze the resume. Please try again.";
    try {
      const j = await res.json();
      msg = (j as { message?: string }).message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export default function AnalyzeWizard({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (a: ResumeAnalysis) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const valid =
    jobDescription.trim().length > 0 &&
    (mode === "upload" ? !!file : resumeText.trim().length >= 50);

  const reset = () => {
    setFile(null);
    setResumeText("");
    setJobDescription("");
    setJobRole("");
    setCompany("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      if (mode === "upload" && file) fd.append("resume", file);
      if (mode === "paste" && resumeText.trim()) fd.append("resumeText", resumeText.trim());
      fd.append("jobDescription", jobDescription.trim());
      if (jobRole.trim()) fd.append("jobRole", jobRole.trim());
      if (company.trim()) fd.append("company", company.trim());
      const result = await analyzeRequest(fd);
      reset();
      onSuccess(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setBusy(false);
    }
  };

  const tab = (m: "upload" | "paste", icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-semibold transition-all ${
        mode === m ? "bg-[var(--cta)] text-white shadow" : "text-ink-soft hover:text-ink"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={busy ? undefined : onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line-strong bg-bg-elevated shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Analyze Resume</h2>
          <button onClick={onClose} disabled={busy} aria-label="Close" className="rounded-lg p-1.5 text-ink-faint hover:bg-white/[0.05] hover:text-ink disabled:opacity-40">
            <X size={18} />
          </button>
        </div>

        <div className="custom-scrollbar max-h-[68vh] space-y-6 overflow-y-auto p-6">
          <p className="text-[13.5px] leading-relaxed text-ink-soft">
            Get an instant ATS score and detailed feedback by comparing your resume to a job description.
          </p>

          <div className="flex w-fit items-center gap-1 rounded-xl bg-white/[0.05] p-1">
            {tab("upload", <FileArrowUp size={15} weight="bold" />, "Upload file (PDF/DOCX)")}
            {tab("paste", <FileText size={15} weight="bold" />, "Paste text")}
          </div>

          {mode === "upload" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                file ? "border-emerald-500/50 bg-emerald-500/[0.06]" : "border-line-strong hover:border-violet/50 hover:bg-white/[0.03]"
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <>
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle size={24} weight="fill" />
                  </div>
                  <p className="text-[14px] font-semibold text-ink">{file.name}</p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">Ready to analyze</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="mt-3 text-[12px] font-medium text-violet-bright hover:underline"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/[0.05] text-ink-faint">
                    <FileArrowUp size={24} />
                  </div>
                  <p className="text-[14px] font-semibold text-ink">Click to upload your resume</p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">PDF or DOCX, max 5MB</p>
                </>
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor="rt">Raw resume text *</Label>
              <Textarea id="rt" className="min-h-40" value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste the full text of your resume here…" />
              <p className="mt-1 text-[11px] text-ink-faint">{resumeText.trim().length} chars (50 min)</p>
            </div>
          )}

          <div className="border-t border-line pt-6">
            <p className="mb-4 text-[11px] font-bold tracking-widest text-ink-faint uppercase">Target role details</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="jd">Job description *</Label>
                <Textarea id="jd" className="min-h-32" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description you're targeting…" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="role">Target role (optional)</Label>
                  <Input id="role" value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="e.g. Frontend Engineer" />
                </div>
                <div>
                  <Label htmlFor="co">Target company (optional)</Label>
                  <Input id="co" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-300">
              <Warning size={15} weight="fill" className="shrink-0" /> {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={!valid || busy}>
            {busy ? (<><CircleNotch size={16} className="animate-spin" /> Analyzing…</>) : "Analyze Resume (5 credits)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
