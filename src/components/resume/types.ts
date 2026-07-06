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
