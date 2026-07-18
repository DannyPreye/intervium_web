// Pure FAQ data — no icon/client imports, so it is safe to import from server
// components (e.g. the root layout's JSON-LD) as well as client sections.
// Written as direct question -> answer pairs so answer engines (ChatGPT,
// Perplexity, Google AI Overviews) can quote them cleanly.
export const FAQ = [
  {
    q: "What is Intavue?",
    a: "Intavue is an AI-powered interview preparation platform. You rehearse with realistic voice mock interviews, get honest scored feedback, and learn the concepts you're weak on with an AI coach — so you walk into the real interview genuinely ready. It runs in your browser and as Windows and macOS desktop apps, and it's free to start.",
  },
  {
    q: "Is Intavue free?",
    a: "Yes. Intavue is free to start — you get 50 credits with no card required. There's also a free résumé ATS score tool at intavue.app/resume-score that needs no sign-up at all. Paid plans start at $15/month (Pro) for 1,000 credits per cycle, plus top-up credit packs that never expire.",
  },
  {
    q: "How do the voice mock interviews and live coding rounds work?",
    a: "You practice by actually talking: the AI interviewer speaks out loud and listens hands-free, just like a real interview. You can choose from several AI interviewers, each with a different personality and voice. For technical roles a built-in editor opens where you write and run code in JavaScript, Python, Java, or C++, and the interviewer reviews your approach, time and space complexity, and edge cases live. After each session you get a full performance report with scores, strengths, gaps, and model answers.",
  },
  {
    q: "Can Intavue check my resume against an ATS?",
    a: "Yes. Paste your résumé (and optionally a job description) and Intavue gives it an ATS-readiness score, flags the keywords you're missing, and lists specific fixes. You can then rebuild a tailored, ATS-friendly résumé with AI help and export a clean PDF. The quick score is free and needs no account at intavue.app/resume-score.",
  },
  {
    q: "What is the Concept Coach?",
    a: "When a mock interview surfaces a weak spot, the Concept Coach teaches it. A patient AI voice tutor — you can pick from several, each with its own teaching style — explains the concept out loud, draws diagrams on a live whiteboard, writes example code alongside you, quizzes you, and sets auto-graded challenges, adapting to how you learn and remembering your progress across sessions.",
  },
  {
    q: "Who is Intavue for?",
    a: "Intavue is for anyone preparing for a job interview: new graduates facing their first technical screen, software engineers and developers switching roles, and career changers who want to practice behavioral and coding interviews out loud before the real thing. It's especially strong for tech interviews (coding rounds and system-design-style questions) but works for behavioral and general interviews too.",
  },
  {
    q: "What runs on which platform?",
    a: "Intavue runs right in your browser — nothing to install — and also ships as native desktop apps for Windows and macOS. The full suite — mock interviews, Concept Coach, résumé tools, cover letters, and your story bank — works everywhere.",
  },
  {
    q: "How do credits work?",
    a: "Actions that call AI cost credits. Free gives you 50 to start, Pro refills 1,000 every cycle, and top-up packs add credits that never expire and stack on any plan. Most actions (résumé analysis, cover letters, a coding run) cost just a few credits; live voice sessions — mock interviews and the Concept Coach — are billed per minute since they stream live audio both ways.",
  },
  {
    q: "Is my data private?",
    a: "Your résumé, sessions, and notes are tied to your account and used only to personalize your prep. You can review and manage your data at any time.",
  },
];
