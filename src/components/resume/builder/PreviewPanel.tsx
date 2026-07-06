"use client";

import React from "react";
import type { StyleConfig, TemplateId } from "../ResumeBuilder";
import type { GeneratedResume } from "../types";
import { resumeVars } from "../templates/_shared";
import { ModernTemplate } from "../templates/Modern";
import { ExecutiveTemplate } from "../templates/Executive";
import { CreativeTemplate } from "../templates/Creative";
import { TechnicalTemplate } from "../templates/Technical";
import { ElegantTemplate } from "../templates/Elegant";
import { MinimalTemplate } from "../templates/Minimal";
import { SharpTemplate } from "../templates/Sharp";

export default function PreviewPanel({
  resume,
  templateId,
  style,
}: {
  resume: GeneratedResume;
  templateId: TemplateId;
  style: StyleConfig;
}) {
  const render = () => {
    switch (templateId) {
      case "executive": return <ExecutiveTemplate resume={resume} style={style} />;
      case "creative": return <CreativeTemplate resume={resume} style={style} />;
      case "technical": return <TechnicalTemplate resume={resume} style={style} />;
      case "elegant": return <ElegantTemplate resume={resume} style={style} />;
      case "minimal": return <MinimalTemplate resume={resume} style={style} />;
      case "sharp": return <SharpTemplate resume={resume} style={style} />;
      default: return <ModernTemplate resume={resume} style={style} />;
    }
  };

  return (
    <div className="relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] print:shadow-none">
      <div
        id="resume-preview"
        className="overflow-visible rounded-sm bg-white text-slate-900"
        style={{
          ...resumeVars(style),
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm",
          color: "#1a1a1a",
          fontFamily: style.bodyFont,
          lineHeight: "1.5",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        {render()}
      </div>

      {/* Section-spacing control + print isolation. The visibility approach is
          the most reliable way to print only the resume from inside the app
          shell (sidebar/header get hidden). */}
      <style>{`
        #resume-preview section + section { margin-top: var(--rs-section, 1.5rem); }
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          #resume-preview, #resume-preview * { visibility: visible !important; }
          #resume-preview {
            position: absolute !important;
            left: 0; top: 0;
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 12mm !important;
            box-shadow: none !important;
            transform: none !important;
            border-radius: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
