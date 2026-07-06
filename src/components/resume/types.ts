/* Mirrors the backend ResumeAnalysis model (resume-analyzer.interface.ts) so the
 * web detail view renders the same rich data the desktop app does. */

export type Importance = "critical" | "important" | "nice-to-have" | string;

export interface ATSKeyword {
  keyword: string;
  found: boolean;
  importance?: Importance;
}

export interface SectionScore {
  section: string;
  score: number;
  feedback?: string;
  suggestions?: string[];
}

export interface RewriteSuggestion {
  section?: string;
  original?: string;
  improved?: string;
  suggested?: string;
  reason?: string;
}

export interface ResumeAnalysis {
  _id?: string;
  id?: string;
  jobDescription?: string;
  jobRole?: string;
  company?: string;
  resumeText?: string;
  atsScore?: number;
  sectionScores?: SectionScore[];
  keywords?: ATSKeyword[];
  strengths?: string[];
  weaknesses?: string[];
  rewriteSuggestions?: RewriteSuggestion[];
  summary?: string;
  createdAt?: string;
}

export const idOf = (a: ResumeAnalysis) => a._id || a.id || "";

export const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-rose-400";

export const scoreBg = (s: number) =>
  s >= 80
    ? "bg-emerald-500/10 border-emerald-500/25"
    : s >= 60
      ? "bg-amber-500/10 border-amber-500/25"
      : "bg-rose-500/10 border-rose-500/25";

export const scoreStroke = (s: number) => (s >= 80 ? "#34d399" : s >= 60 ? "#fbbf24" : "#fb7185");

/** Section scores sometimes arrive on a 0-10 scale; normalize to a percentage. */
export const normScore = (raw: number) => (raw <= 10 && raw > 0 ? raw * 10 : raw);

export const normImportance = (imp?: string) => (imp || "").toLowerCase().replace(/[\s_-]/g, "");

/* ── Generated (tailored) resume — mirrors generated-resume.interface.ts ── */

export interface ResumePersonalInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}
export interface ResumeExperience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  location?: string;
  achievements: string[];
}
export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  location?: string;
  gpa?: string;
}
export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}
export interface ResumeAward {
  title: string;
  date: string;
  issuer: string;
  description?: string;
}
export interface ResumeLanguage {
  language: string;
  proficiency: string;
}
export interface ResumeVolunteer {
  organization: string;
  role: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  achievements?: string[];
}
export interface ResumePublication {
  title: string;
  publisher: string;
  date: string;
  link?: string;
  description?: string;
}
export interface ResumeReference {
  name: string;
  title: string;
  company: string;
  contact: string;
}
export interface ResumeSkills {
  technical: string[];
  soft: string[];
}
export interface GeneratedResume {
  _id?: string;
  analysisId?: string;
  jobTitle?: string;
  jobDescription?: string;
  personalInfo: ResumePersonalInfo;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkills;
  projects?: ResumeProject[];
  certifications?: string[];
  awards?: ResumeAward[];
  languages?: ResumeLanguage[];
  publications?: ResumePublication[];
  volunteerWork?: ResumeVolunteer[];
  interests?: string[];
  references?: ResumeReference[];
  createdAt?: string;
  updatedAt?: string;
}

/** Section names the backend accepts for edit/generate. */
export type ResumeSectionName =
  | "personalInfo" | "summary" | "experience" | "education" | "skills"
  | "projects" | "certifications" | "awards" | "languages"
  | "publications" | "volunteerWork" | "interests" | "references";
