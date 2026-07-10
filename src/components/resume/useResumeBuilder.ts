"use client";

import { api } from "@/lib/api";
import type { GeneratedResume, ResumeSectionName } from "./types";

/* Thin wrappers over the resume-generator endpoints (all return the raw
 * GeneratedResume). Mirrors the desktop useResumeGenerator react-query hooks. */

export const generateResumeFromAnalysis = (analysisId: string) =>
  api<GeneratedResume>(`/v1/resume-analyzer/${analysisId}/generate-resume`, { method: "POST" });

export const getGeneratedByAnalysis = (analysisId: string) =>
  api<GeneratedResume>(`/v1/resume-analyzer/${analysisId}/generated-resume`);

export const getResumeById = (resumeId: string) =>
  api<GeneratedResume>(`/v1/resume-analyzer/resume/${resumeId}`);

export type ResumeListItem = {
  _id: string;
  jobTitle?: string;
  jobDescription?: string;
  personalInfo?: { name?: string };
  createdAt?: string;
};

/** Lightweight list of the user's tailored resumes (for pickers, e.g. cover letters). */
export const listGeneratedResumes = () =>
  api<{ resumes: ResumeListItem[] }>(`/v1/resume-analyzer/resumes`);

export const updateResumeSection = (resumeId: string, sectionName: ResumeSectionName, value: unknown) =>
  // Body is wrapped in { data } — a top-level JSON string (e.g. summary) is
  // otherwise rejected by the body parser and corrupts the saved section.
  api<GeneratedResume>(`/v1/resume-analyzer/resume/${resumeId}/section/${sectionName}`, {
    method: "PUT",
    body: { data: value },
  });

export const generateResumeSection = (resumeId: string, sectionName: ResumeSectionName, prompt: string) =>
  api<GeneratedResume>(`/v1/resume-analyzer/resume/${resumeId}/section/${sectionName}/generate`, {
    method: "POST",
    body: { prompt },
  });
