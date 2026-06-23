// Pure FAQ data — no icon/client imports, so it is safe to import from server
// components (e.g. the root layout's JSON-LD) as well as client sections.
export const FAQ = [
  {
    q: "Is Intavue actually invisible during a screen share?",
    a: "Yes. On supported devices the window is excluded from the operating system's capture pipeline, so it does not appear in screen recordings or screen-share, while staying fully visible to you. Capture protection is available on Windows 10 version 2004 and newer, and on macOS.",
  },
  {
    q: "Which apps does it stay hidden on?",
    a: "Because the protection works at the OS level, it covers the tools that capture your screen, including Zoom, Google Meet, Microsoft Teams, and Webex.",
  },
  {
    q: "What runs on which platform?",
    a: "Intavue runs on Windows and macOS. The full prep suite (mock interviews, resume tools, cover letters, and your story bank) works on both, and the invisible live copilot needs OS-level capture protection, available on Windows 10 (2004+) and macOS.",
  },
  {
    q: "How do the voice mock interviews and live coding work?",
    a: "Alex, the AI interviewer, speaks out loud and listens hands-free, so you practice by actually talking — just like the real thing. For technical roles a built-in editor opens where you write and run code in JavaScript, Python, Java, or C++, and Alex reviews your approach, complexity, and edge cases live. After each session you get a full performance report with scores and specific coaching.",
  },
  {
    q: "How do credits work?",
    a: "Actions that call AI cost credits. Free gives you 50 to start, Pro refills 1,000 every cycle, and top-up packs add credits that never expire and stack on any plan. Most actions (resume analysis, cover letters, a coding run) cost just a few credits; the real-time voice interview costs more per minute since it streams live audio both ways — roughly an hour of live interviewing per Pro cycle.",
  },
  {
    q: "Is my data private?",
    a: "Your resume, sessions, and notes are tied to your account and used to personalize your prep. Nothing about Intavue appears on a shared screen unless you choose to show it.",
  },
  {
    q: "How should I use the live copilot responsibly?",
    a: "Intavue is built to make you genuinely better prepared. Treat live assist as private notes and structure support, and always follow the rules of any assessment you take part in.",
  },
];
