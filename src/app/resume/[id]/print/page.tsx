"use client";

/* Standalone print/PDF route — rendered OUTSIDE the (app) group so there is no
 * sidebar, header, scaled wrapper, or overflow-hidden ancestor. That matters for
 * two reasons:
 *   1. Printing from here keeps text as real, selectable, ATS-readable text
 *      (the in-app preview's scaled/transformed ancestors caused the browser to
 *      rasterize/outline the text — producing a PDF with no text layer).
 *   2. A headless Chromium (Puppeteer / a hosted HTML->PDF API) can navigate to
 *      this exact URL and call page.pdf() for a pixel-perfect, deterministic PDF.
 *
 * The page fetches the saved resume by id, applies the style passed via query
 * params, waits for fonts, then signals readiness (document readiness flag +
 * optional ?autoprint=1) so the capturer knows the page is fully painted.
 */

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { session } from "@/lib/session";
import { getResumeById } from "@/components/resume/useResumeBuilder";
import type { GeneratedResume } from "@/components/resume/types";
import type { FontSize, StyleConfig, TemplateId } from "@/components/resume/ResumeBuilder";
import { resumeVars } from "@/components/resume/templates/_shared";
import { ModernTemplate } from "@/components/resume/templates/Modern";
import { ExecutiveTemplate } from "@/components/resume/templates/Executive";
import { CreativeTemplate } from "@/components/resume/templates/Creative";
import { TechnicalTemplate } from "@/components/resume/templates/Technical";
import { ElegantTemplate } from "@/components/resume/templates/Elegant";
import { MinimalTemplate } from "@/components/resume/templates/Minimal";
import { SharpTemplate } from "@/components/resume/templates/Sharp";

function renderTemplate(templateId: TemplateId, resume: GeneratedResume, style: StyleConfig) {
  switch (templateId) {
    case "executive": return <ExecutiveTemplate resume={resume} style={style} />;
    case "creative": return <CreativeTemplate resume={resume} style={style} />;
    case "technical": return <TechnicalTemplate resume={resume} style={style} />;
    case "elegant": return <ElegantTemplate resume={resume} style={style} />;
    case "minimal": return <MinimalTemplate resume={resume} style={style} />;
    case "sharp": return <SharpTemplate resume={resume} style={style} />;
    default: return <ModernTemplate resume={resume} style={style} />;
  }
}

export default function ResumePrintPage() {
  // useSearchParams() must sit under a Suspense boundary or Next fails the build.
  return (
    <Suspense fallback={null}>
      <PrintView />
    </Suspense>
  );
}

function PrintView() {
  const params = useParams<{ id: string }>();
  const q = useSearchParams();
  const id = params.id;

  const templateId = (q.get("template") as TemplateId) || "modern";
  const style: StyleConfig = useMemo(
    () => ({
      primaryColor: q.get("pc") || "#6366f1",
      secondaryColor: q.get("sc") || "#475569",
      headingFont: q.get("hf") || "Inter",
      bodyFont: q.get("bf") || "Inter",
      fontSize: (q.get("fs") as FontSize) || "medium",
      sectionSpacing: Number(q.get("ss")) || 1.5,
    }),
    [q],
  );

  const [resume, setResume] = useState<GeneratedResume | null>(null);
  const [error, setError] = useState(false);

  // If a bearer token is supplied (headless-Chromium case, which has no
  // localStorage session), adopt it before the authed fetch runs.
  useEffect(() => {
    const token = q.get("token");
    if (token) session.set(token);
  }, [q]);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    getResumeById(id)
      .then((r) => { if (alive) setResume(r); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [id]);

  // Load the chosen Google Fonts so the PDF matches the preview exactly.
  useEffect(() => {
    const fonts = new Set([style.headingFont, style.bodyFont]);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?" +
      Array.from(fonts).map((f) => `family=${f.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800;900`).join("&") +
      "&display=swap";
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, [style.headingFont, style.bodyFont]);

  // Signal "fully painted" once the resume is rendered and fonts are ready, so a
  // headless capturer can wait for `document.documentElement.dataset.pdfReady`.
  // In the browser path, ?autoprint=1 opens the native print dialog automatically.
  useEffect(() => {
    if (!resume) return;
    let cancelled = false;
    const ready = (document as Document & { fonts?: FontFaceSet }).fonts?.ready ?? Promise.resolve();
    ready.then(() => {
      if (cancelled) return;
      document.documentElement.dataset.pdfReady = "1";
      if (q.get("autoprint") === "1") setTimeout(() => window.print(), 120);
    });
    return () => { cancelled = true; };
  }, [resume, q]);

  return (
    <>
      <style>{`
        :root { background: #fff; }
        html, body { margin: 0; padding: 0; background: #fff; }
        #pdf-sheet section + section { margin-top: var(--rs-section, 1.5rem); }

        /* On screen, frame the sheet like paper so the print view is previewable. */
        @media screen {
          body { background: #525659; padding: 24px; display: flex; justify-content: center; }
          #pdf-sheet { box-shadow: 0 10px 40px rgba(0,0,0,.4); }
        }

        /* Structural page-break rules so entries never split mid-block. */
        #pdf-sheet, #pdf-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        #pdf-sheet h1, #pdf-sheet h2, #pdf-sheet h3, #pdf-sheet h4 { break-after: avoid; }
        #pdf-sheet li { break-inside: avoid; }
        #pdf-sheet section > * { break-inside: avoid; }

        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: #fff !important; padding: 0; display: block; }
          #pdf-sheet { width: auto !important; min-height: 0 !important; padding: 0 !important; box-shadow: none !important; }
        }
      `}</style>

      {error && (
        <div style={{ fontFamily: "system-ui", color: "#333", padding: 40 }}>
          Couldn&apos;t load this resume. The link may have expired.
        </div>
      )}

      {resume && (
        <div
          id="pdf-sheet"
          style={{
            ...resumeVars(style),
            width: "210mm",
            minHeight: "297mm",
            padding: "16mm",
            background: "#fff",
            color: "#1a1a1a",
            fontFamily: style.bodyFont,
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
        >
          {renderTemplate(templateId, resume, style)}
        </div>
      )}
    </>
  );
}
