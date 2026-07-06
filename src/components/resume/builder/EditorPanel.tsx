"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, FileText, Briefcase, GraduationCap, Code, FolderSimple, Certificate, Trophy,
  Heart, Translate, Sparkle, Users, CaretDown, CaretRight, CaretDoubleLeft, CaretDoubleRight,
  Plus, Trash,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import type { GeneratedResume, ResumeSectionName } from "../types";
import { updateResumeSection, generateResumeSection } from "../useResumeBuilder";

/* ── tiny labelled-field helpers (web Input/Textarea are label-less) ── */
function Field(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{props.label}</Label>
      <Input className="h-10 text-[14px]" value={props.value} placeholder={props.placeholder} onChange={(e) => props.onChange(e.target.value)} />
    </div>
  );
}
function Area(props: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      <Label>{props.label}</Label>
      <Textarea className="min-h-0 text-[14px]" rows={props.rows ?? 3} value={props.value} placeholder={props.placeholder} onChange={(e) => props.onChange(e.target.value)} />
    </div>
  );
}
function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong py-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-white/[0.03] hover:text-ink">
      <Plus size={14} weight="bold" /> {children}
    </button>
  );
}
function ItemCard({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <Card className="group/item relative space-y-3 p-4">
      <button onClick={onRemove} aria-label="Remove" className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white opacity-0 shadow transition-opacity group-hover/item:opacity-100">
        <Trash size={12} />
      </button>
      {children}
    </Card>
  );
}

const SECTIONS: { id: ResumeSectionName; title: string; icon: React.ElementType }[] = [
  { id: "personalInfo", title: "Personal Info", icon: User },
  { id: "summary", title: "Professional Summary", icon: FileText },
  { id: "experience", title: "Work Experience", icon: Briefcase },
  { id: "education", title: "Education", icon: GraduationCap },
  { id: "skills", title: "Skills", icon: Code },
  { id: "projects", title: "Projects", icon: FolderSimple },
  { id: "certifications", title: "Certifications", icon: Certificate },
  { id: "awards", title: "Awards", icon: Trophy },
  { id: "volunteerWork", title: "Volunteer Work", icon: Heart },
  { id: "publications", title: "Publications", icon: FileText },
  { id: "languages", title: "Languages", icon: Translate },
  { id: "interests", title: "Interests", icon: Sparkle },
  { id: "references", title: "References", icon: Users },
];

export default function EditorPanel({
  resume,
  onUpdate,
  isCollapsed,
  onToggleCollapse,
}: {
  resume: GeneratedResume;
  onUpdate: (r: GeneratedResume) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [active, setActive] = useState<ResumeSectionName | "">("personalInfo");
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => () => { Object.values(timers.current).forEach(clearTimeout); }, []);

  const set = (name: ResumeSectionName, data: unknown) => {
    onUpdate({ ...resume, [name]: data } as GeneratedResume);
    const id = resume._id;
    if (!id) return;
    if (timers.current[name]) clearTimeout(timers.current[name]);
    timers.current[name] = setTimeout(() => {
      updateResumeSection(id, name, data).catch(() => {});
    }, 1000);
  };

  const aiPolish = async (name: ResumeSectionName) => {
    if (!resume._id || generating) return;
    if (!window.confirm("Rewrite this section with AI? This uses 2 credits.")) return;
    const prompt = prompts[name] || `Please improve the ${name} section of my resume to be more professional and ATS-friendly.`;
    setGenerating(name);
    try {
      const next = await generateResumeSection(resume._id, name, prompt);
      onUpdate(next);
    } catch {
      /* surfaced via disabled state resetting */
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className={`flex items-center justify-between border-b border-line bg-bg/20 ${isCollapsed ? "flex-col gap-4 p-4" : "p-6"}`}>
        {!isCollapsed && (
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Resume Architect</h3>
            <p className="text-[11px] text-ink-faint">Refine your professional story.</p>
          </div>
        )}
        <button onClick={onToggleCollapse} title={isCollapsed ? "Expand" : "Collapse"} className="grid h-9 w-9 place-items-center rounded-xl border border-line-strong bg-white/[0.05] text-ink-soft hover:text-ink">
          {isCollapsed ? <CaretDoubleRight size={16} /> : <CaretDoubleLeft size={16} />}
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto ${isCollapsed ? "space-y-3 p-3" : "space-y-3 p-5"}`}>
        {SECTIONS.map((s) => {
          const on = active === s.id;
          const Icon = s.icon;

          if (isCollapsed) {
            return (
              <button
                key={s.id}
                onClick={() => { onToggleCollapse(); setActive(s.id); }}
                title={s.title}
                className={`mx-auto grid h-11 w-11 place-items-center rounded-2xl transition-all ${on ? "bg-violet text-white" : "bg-bg-raised text-ink-soft hover:text-ink"}`}
              >
                <Icon size={18} weight={on ? "fill" : "regular"} />
              </button>
            );
          }

          return (
            <div key={s.id}>
              <button
                onClick={() => setActive(on ? "" : s.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 transition-all ${on ? "border-violet/30 bg-violet/10" : "border-line bg-white/[0.02] hover:bg-white/[0.05]"}`}
              >
                <span className="flex items-center gap-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${on ? "bg-violet text-white" : "bg-bg-raised text-ink-soft"}`}>
                    <Icon size={17} weight={on ? "fill" : "regular"} />
                  </span>
                  <span className={`text-[13.5px] font-bold ${on ? "text-ink" : "text-ink-soft"}`}>{s.title}</span>
                </span>
                {on ? <CaretDown size={15} className="text-violet-bright" /> : <CaretRight size={15} className="text-ink-faint" />}
              </button>

              <AnimatePresence initial={false}>
                {on && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="mx-1 space-y-5 rounded-b-2xl border-x border-b border-line bg-white/[0.01] p-5">
                      {/* AI assistant */}
                      <div className="space-y-3 rounded-xl border border-violet/10 bg-violet/[0.05] p-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-violet-bright uppercase">
                            <Sparkle size={14} weight="fill" /> AI assistant
                          </span>
                          <button
                            onClick={() => aiPolish(s.id)}
                            disabled={generating === s.id}
                            className="flex items-center gap-1.5 rounded-xl border border-violet/20 bg-violet/10 px-3 py-1.5 text-[10px] font-black tracking-widest text-violet-bright uppercase transition-all hover:bg-violet/20 disabled:opacity-50"
                          >
                            <Sparkle size={13} weight="fill" className={generating === s.id ? "animate-spin" : ""} />
                            {generating === s.id ? "Optimizing…" : "AI Polish"}
                          </button>
                        </div>
                        <Area
                          label="Custom instructions"
                          rows={2}
                          value={prompts[s.id] ?? `Please improve the ${s.id} section of my resume to be more professional and ATS-friendly.`}
                          onChange={(v) => setPrompts((p) => ({ ...p, [s.id]: v }))}
                        />
                      </div>

                      {s.id === "personalInfo" && (
                        <div className="grid grid-cols-2 gap-3">
                          {(["name", "email", "phone", "location", "linkedIn", "portfolio"] as const).map((k) => (
                            <Field key={k} label={k === "linkedIn" ? "LinkedIn" : k[0].toUpperCase() + k.slice(1)}
                              value={(resume.personalInfo?.[k] as string) || ""}
                              onChange={(v) => set("personalInfo", { ...resume.personalInfo, [k]: v })} />
                          ))}
                        </div>
                      )}

                      {s.id === "summary" && (
                        <Area label="Professional summary" rows={6} value={resume.summary || ""} onChange={(v) => set("summary", v)} />
                      )}

                      {s.id === "experience" && (
                        <div className="space-y-4">
                          {resume.experience?.map((exp, idx) => (
                            <ItemCard key={idx} onRemove={() => { const l = [...(resume.experience || [])]; l.splice(idx, 1); set("experience", l); }}>
                              <div className="grid grid-cols-2 gap-3">
                                <Field label="Company" value={exp.company || ""} onChange={(v) => { const l = [...(resume.experience || [])]; l[idx] = { ...exp, company: v }; set("experience", l); }} />
                                <Field label="Role" value={exp.role || ""} onChange={(v) => { const l = [...(resume.experience || [])]; l[idx] = { ...exp, role: v }; set("experience", l); }} />
                                <Field label="Start Date" value={exp.startDate || ""} onChange={(v) => { const l = [...(resume.experience || [])]; l[idx] = { ...exp, startDate: v }; set("experience", l); }} />
                                <Field label="End Date" value={exp.endDate || ""} onChange={(v) => { const l = [...(resume.experience || [])]; l[idx] = { ...exp, endDate: v }; set("experience", l); }} />
                              </div>
                              <Area label="Achievements (one per line)" rows={4} value={exp.achievements?.join("\n") || ""} onChange={(v) => { const l = [...(resume.experience || [])]; l[idx] = { ...exp, achievements: v.split("\n") }; set("experience", l); }} />
                            </ItemCard>
                          ))}
                          <AddBtn onClick={() => set("experience", [...(resume.experience || []), { company: "", role: "", startDate: "", achievements: [] }])}>Add experience</AddBtn>
                        </div>
                      )}

                      {s.id === "education" && (
                        <div className="space-y-4">
                          {resume.education?.map((edu, idx) => (
                            <ItemCard key={idx} onRemove={() => { const l = [...(resume.education || [])]; l.splice(idx, 1); set("education", l); }}>
                              <Field label="Institution" value={edu.institution || ""} onChange={(v) => { const l = [...(resume.education || [])]; l[idx] = { ...edu, institution: v }; set("education", l); }} />
                              <div className="grid grid-cols-2 gap-3">
                                <Field label="Degree" value={edu.degree || ""} onChange={(v) => { const l = [...(resume.education || [])]; l[idx] = { ...edu, degree: v }; set("education", l); }} />
                                <Field label="Field of Study" value={edu.field || ""} onChange={(v) => { const l = [...(resume.education || [])]; l[idx] = { ...edu, field: v }; set("education", l); }} />
                                <Field label="Start Date" value={edu.startDate || ""} onChange={(v) => { const l = [...(resume.education || [])]; l[idx] = { ...edu, startDate: v }; set("education", l); }} />
                                <Field label="End Date" value={edu.endDate || ""} onChange={(v) => { const l = [...(resume.education || [])]; l[idx] = { ...edu, endDate: v }; set("education", l); }} />
                              </div>
                            </ItemCard>
                          ))}
                          <AddBtn onClick={() => set("education", [...(resume.education || []), { institution: "", degree: "", field: "", startDate: "" }])}>Add education</AddBtn>
                        </div>
                      )}

                      {s.id === "skills" && (
                        <div className="space-y-4">
                          <Area label="Technical skills (comma separated)" rows={3} value={resume.skills?.technical?.join(", ") || ""} onChange={(v) => set("skills", { ...resume.skills, technical: v.split(",").map((x) => x.trim()) })} />
                          <Area label="Soft skills (comma separated)" rows={3} value={resume.skills?.soft?.join(", ") || ""} onChange={(v) => set("skills", { ...resume.skills, soft: v.split(",").map((x) => x.trim()) })} />
                        </div>
                      )}

                      {s.id === "projects" && (
                        <div className="space-y-4">
                          {resume.projects?.map((p, idx) => (
                            <ItemCard key={idx} onRemove={() => { const l = [...(resume.projects || [])]; l.splice(idx, 1); set("projects", l); }}>
                              <Field label="Project Name" value={p.name || ""} onChange={(v) => { const l = [...(resume.projects || [])]; l[idx] = { ...p, name: v }; set("projects", l); }} />
                              <Area label="Description" rows={3} value={p.description || ""} onChange={(v) => { const l = [...(resume.projects || [])]; l[idx] = { ...p, description: v }; set("projects", l); }} />
                              <Field label="Technologies (comma separated)" value={p.technologies?.join(", ") || ""} onChange={(v) => { const l = [...(resume.projects || [])]; l[idx] = { ...p, technologies: v.split(",").map((t) => t.trim()) }; set("projects", l); }} />
                              <Field label="Project Link" value={p.link || ""} onChange={(v) => { const l = [...(resume.projects || [])]; l[idx] = { ...p, link: v }; set("projects", l); }} />
                            </ItemCard>
                          ))}
                          <AddBtn onClick={() => set("projects", [...(resume.projects || []), { name: "", description: "", technologies: [] }])}>Add project</AddBtn>
                        </div>
                      )}

                      {s.id === "certifications" && (
                        <Area label="Certifications (one per line)" rows={6} value={resume.certifications?.join("\n") || ""} onChange={(v) => set("certifications", v.split("\n"))} />
                      )}

                      {s.id === "awards" && (
                        <div className="space-y-4">
                          {resume.awards?.map((a, idx) => (
                            <ItemCard key={idx} onRemove={() => { const l = [...(resume.awards || [])]; l.splice(idx, 1); set("awards", l); }}>
                              <Field label="Award Title" value={a.title || ""} onChange={(v) => { const l = [...(resume.awards || [])]; l[idx] = { ...a, title: v }; set("awards", l); }} />
                              <div className="grid grid-cols-2 gap-3">
                                <Field label="Issuer" value={a.issuer || ""} onChange={(v) => { const l = [...(resume.awards || [])]; l[idx] = { ...a, issuer: v }; set("awards", l); }} />
                                <Field label="Date" value={a.date || ""} onChange={(v) => { const l = [...(resume.awards || [])]; l[idx] = { ...a, date: v }; set("awards", l); }} />
                              </div>
                            </ItemCard>
                          ))}
                          <AddBtn onClick={() => set("awards", [...(resume.awards || []), { title: "", issuer: "", date: "" }])}>Add award</AddBtn>
                        </div>
                      )}

                      {s.id === "volunteerWork" && (
                        <div className="space-y-4">
                          {resume.volunteerWork?.map((vv, idx) => (
                            <ItemCard key={idx} onRemove={() => { const l = [...(resume.volunteerWork || [])]; l.splice(idx, 1); set("volunteerWork", l); }}>
                              <Field label="Role" value={vv.role || ""} onChange={(v) => { const l = [...(resume.volunteerWork || [])]; l[idx] = { ...vv, role: v }; set("volunteerWork", l); }} />
                              <Field label="Organization" value={vv.organization || ""} onChange={(v) => { const l = [...(resume.volunteerWork || [])]; l[idx] = { ...vv, organization: v }; set("volunteerWork", l); }} />
                            </ItemCard>
                          ))}
                          <AddBtn onClick={() => set("volunteerWork", [...(resume.volunteerWork || []), { role: "", organization: "", achievements: [] }])}>Add volunteer work</AddBtn>
                        </div>
                      )}

                      {s.id === "publications" && (
                        <div className="space-y-4">
                          {resume.publications?.map((pub, idx) => (
                            <ItemCard key={idx} onRemove={() => { const l = [...(resume.publications || [])]; l.splice(idx, 1); set("publications", l); }}>
                              <Field label="Title" value={pub.title || ""} onChange={(v) => { const l = [...(resume.publications || [])]; l[idx] = { ...pub, title: v }; set("publications", l); }} />
                              <div className="grid grid-cols-2 gap-3">
                                <Field label="Publisher" value={pub.publisher || ""} onChange={(v) => { const l = [...(resume.publications || [])]; l[idx] = { ...pub, publisher: v }; set("publications", l); }} />
                                <Field label="Date" value={pub.date || ""} onChange={(v) => { const l = [...(resume.publications || [])]; l[idx] = { ...pub, date: v }; set("publications", l); }} />
                              </div>
                            </ItemCard>
                          ))}
                          <AddBtn onClick={() => set("publications", [...(resume.publications || []), { title: "", publisher: "", date: "" }])}>Add publication</AddBtn>
                        </div>
                      )}

                      {s.id === "languages" && (
                        <div className="space-y-4">
                          {resume.languages?.map((lang, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-3 border-b border-line pb-3">
                              <Field label="Language" value={lang.language || ""} onChange={(v) => { const l = [...(resume.languages || [])]; l[idx] = { ...lang, language: v }; set("languages", l); }} />
                              <Field label="Proficiency" value={lang.proficiency || ""} onChange={(v) => { const l = [...(resume.languages || [])]; l[idx] = { ...lang, proficiency: v }; set("languages", l); }} />
                            </div>
                          ))}
                          <AddBtn onClick={() => set("languages", [...(resume.languages || []), { language: "", proficiency: "" }])}>Add language</AddBtn>
                        </div>
                      )}

                      {s.id === "interests" && (
                        <Area label="Interests (comma separated)" rows={3} value={resume.interests?.join(", ") || ""} onChange={(v) => set("interests", v.split(",").map((x) => x.trim()))} />
                      )}

                      {s.id === "references" && (
                        <div className="space-y-4">
                          {resume.references?.map((ref, idx) => (
                            <ItemCard key={idx} onRemove={() => { const l = [...(resume.references || [])]; l.splice(idx, 1); set("references", l); }}>
                              <Field label="Name" value={ref.name || ""} onChange={(v) => { const l = [...(resume.references || [])]; l[idx] = { ...ref, name: v }; set("references", l); }} />
                              <div className="grid grid-cols-2 gap-3">
                                <Field label="Title" value={ref.title || ""} onChange={(v) => { const l = [...(resume.references || [])]; l[idx] = { ...ref, title: v }; set("references", l); }} />
                                <Field label="Company" value={ref.company || ""} onChange={(v) => { const l = [...(resume.references || [])]; l[idx] = { ...ref, company: v }; set("references", l); }} />
                              </div>
                              <Field label="Contact Info" value={ref.contact || ""} onChange={(v) => { const l = [...(resume.references || [])]; l[idx] = { ...ref, contact: v }; set("references", l); }} />
                            </ItemCard>
                          ))}
                          <AddBtn onClick={() => set("references", [...(resume.references || []), { name: "", title: "", company: "", contact: "" }])}>Add reference</AddBtn>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
