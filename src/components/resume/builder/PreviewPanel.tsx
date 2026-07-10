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

/* On-screen preview only. The actual PDF/print is produced by the standalone
 * /resume/[id]/print route (no scaled/overflow ancestors), which keeps real
 * selectable text and clean page breaks. */
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
    <div className="relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
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
        }}
      >
        {render()}
      </div>

      <style>{`#resume-preview section + section { margin-top: var(--rs-section, 1.5rem); }`}</style>
    </div>
  );
}
