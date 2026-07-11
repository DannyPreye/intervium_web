/* Display metadata for the interviewer / coach personas. The `id`s MUST match
 * backend/src/config/personas.ts — the backend owns the voice + personality, the
 * frontend only shows the picker and sends the chosen id. */

export type PersonaMeta = {
  id: string;
  name: string;
  tagline: string;
  blurb: string;
  accent: string; // hex, used for the avatar gradient
  initial: string;
};

export const INTERVIEWERS: PersonaMeta[] = [
  { id: "marcus", name: "Marcus", tagline: "Warm but rigorous", blurb: "Puts you at ease, then digs for real depth.", accent: "#6366f1", initial: "M" },
  { id: "priya", name: "Priya", tagline: "Sharp & fast-paced", blurb: "High energy, incisive follow-ups.", accent: "#ec4899", initial: "P" },
  { id: "david", name: "David", tagline: "Tough bar-raiser", blurb: "Direct, high-pressure, no hand-holding.", accent: "#ef4444", initial: "D" },
  { id: "elena", name: "Elena", tagline: "Calm & analytical", blurb: "Probes trade-offs and the “why”.", accent: "#14b8a6", initial: "E" },
];

export const COACHES: PersonaMeta[] = [
  { id: "sofia", name: "Sofia", tagline: "Warm & patient", blurb: "Clear analogies, celebrates small wins.", accent: "#ec4899", initial: "S" },
  { id: "ray", name: "Ray", tagline: "High-energy & fun", blurb: "Vivid examples and “aha” moments.", accent: "#f59e0b", initial: "R" },
  { id: "nadia", name: "Nadia", tagline: "Calm & structured", blurb: "First principles, one clean step at a time.", accent: "#14b8a6", initial: "N" },
  { id: "tom", name: "Tom", tagline: "Chill & practical", blurb: "The real-world way, hands-on.", accent: "#0ea5e9", initial: "T" },
];

export const interviewerName = (id?: string) => INTERVIEWERS.find((p) => p.id === id)?.name ?? INTERVIEWERS[0].name;
export const coachName = (id?: string) => COACHES.find((p) => p.id === id)?.name ?? COACHES[0].name;
