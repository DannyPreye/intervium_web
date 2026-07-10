export type Shot = {
  /** File under /public/screenshots. */
  src: string;
  alt: string;
  title: string;
  caption: string;
};

/* Real product screenshots for the landing "See it in action" section. First
 * entry is shown large (hero); the rest form the grid below. Source images are
 * 1600×766 (~2.09:1); the frame uses that aspect so nothing is cropped. */
export const SCREENSHOTS: Shot[] = [
  {
    src: "/screenshots/mock-interview.jpg",
    alt: "Intavue live voice mock interview with Alex, the AI interviewer",
    title: "Live voice mock interviews",
    caption: "Rehearse out loud with an AI interviewer that asks real follow-ups — then get a scored report.",
  },
  {
    src: "/screenshots/concept-coach.jpg",
    alt: "Intavue Concept Coach with a live whiteboard diagram",
    title: "Concept Coach",
    caption: "An AI voice tutor that teaches what you fumble — with live diagrams, code, and quick quizzes.",
  },
  {
    src: "/screenshots/resume-analyzer.jpg",
    alt: "Intavue resume analyzer showing an ATS score and section breakdown",
    title: "ATS resume analyzer",
    caption: "Score your resume against any job and see exactly what to fix, section by section.",
  },
  {
    src: "/screenshots/resume-builder.jpg",
    alt: "Intavue resume builder with a live preview and AI assistant",
    title: "Resume builder",
    caption: "Rebuild a tailored, ATS-ready resume with AI help, then export a clean PDF.",
  },
];
