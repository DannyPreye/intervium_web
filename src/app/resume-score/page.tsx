import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ResumeScoreClient from "./ResumeScoreClient";

const TITLE = "Free Resume ATS Score Checker — Intavue";
const DESCRIPTION =
  "Paste your resume and get a free ATS score with 3 specific fixes and missing keywords in ~20 seconds. No sign-up. Then rebuild a tailored, ATS-ready resume with Intavue.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/resume-score" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://intavue.app/resume-score",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function ResumeScorePage() {
  return (
    <div className="relative min-h-[100dvh] bg-bg text-ink">
      <div className="aura pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      {/* Header */}
      <header className="relative z-10 border-b border-line">
        <div className="container-x flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/mark.png" alt="Intavue" width={28} height={28} className="h-7 w-7" />
            <span className="font-display text-[17px] font-bold tracking-[-0.02em]">Intavue</span>
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[var(--cta)] px-5 py-2 text-[13.5px] font-semibold text-white transition-all hover:brightness-110"
          >
            Start free
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-4 pt-14 pb-24 sm:pt-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-violet/[0.08] px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.18em] text-violet-bright uppercase">
            Free tool · No sign-up
          </span>
          <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance">
            Is your résumé <span className="text-violet-bright">interview-ready?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[1.02rem] leading-relaxed text-pretty text-ink-soft">
            Paste it below for a free ATS score, three specific fixes, and the keywords you&rsquo;re missing — in about 20 seconds.
          </p>
        </div>

        <ResumeScoreClient />
      </main>
    </div>
  );
}
