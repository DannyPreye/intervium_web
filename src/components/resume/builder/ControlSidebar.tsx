"use client";

import React from "react";
import { Check, SquaresFour, TextAa, Palette } from "@phosphor-icons/react";
import type { FontSize, StyleConfig, TemplateId } from "../ResumeBuilder";

export const TEMPLATES: { id: TemplateId; label: string; desc: string }[] = [
  { id: "modern", label: "Modern Minimalist", desc: "Clean, sans-serif, high readability." },
  { id: "executive", label: "Executive Classic", desc: "Traditional, professional serif headers." },
  { id: "creative", label: "Creative Dynamic", desc: "Bold color band header, single column." },
  { id: "technical", label: "Technical Clean", desc: "Timeline layout, ideal for developers." },
  { id: "elegant", label: "Elegant Professional", desc: "Refined two-column label layout." },
  { id: "minimal", label: "Minimal Pure", desc: "Ultra-clean, whitespace-first design." },
  { id: "sharp", label: "Sharp Bold", desc: "Strong ruled dividers, high contrast." },
];

const FONTS = ["Inter", "Roboto", "Open Sans", "Montserrat", "Playfair Display", "Lora", "Merriweather", "Fira Code"];

const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: "small", label: "Compact" },
  { id: "medium", label: "Standard" },
  { id: "large", label: "Spacious" },
];

const COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Emerald", value: "#10b981" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Slate", value: "#475569" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Teal", value: "#14b8a6" },
];

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded border border-violet/25 bg-violet/10 text-violet-bright">
        <Icon size={13} weight="bold" />
      </span>
      <h3 className="text-[10px] font-bold tracking-widest text-ink-faint uppercase">{title}</h3>
    </div>
  );
}

export default function ControlSidebar({
  selectedTemplate,
  onTemplateChange,
  styleConfig,
  onStyleChange,
}: {
  selectedTemplate: TemplateId;
  onTemplateChange: (id: TemplateId) => void;
  styleConfig: StyleConfig;
  onStyleChange: (config: StyleConfig) => void;
}) {
  return (
    <div className="space-y-10 pb-8">
      <section>
        <SectionHeader icon={SquaresFour} title="Visual template" />
        <div className="grid gap-3">
          {TEMPLATES.map((t) => {
            const on = selectedTemplate === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTemplateChange(t.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  on ? "border-violet/40 bg-violet/10 ring-1 ring-violet/30" : "border-line bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className={`text-[12px] font-bold ${on ? "text-violet-bright" : "text-ink-soft"}`}>{t.label}</span>
                  {on && (
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-violet text-white">
                      <Check size={10} weight="bold" />
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] leading-relaxed text-ink-faint">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader icon={TextAa} title="Typography & size" />
        <div className="space-y-5">
          <div className="space-y-4 rounded-2xl border border-line bg-white/[0.02] p-4">
            {(["headingFont", "bodyFont"] as const).map((key) => (
              <div key={key}>
                <label className="mb-2 block text-[9px] font-black tracking-widest text-ink-faint uppercase">
                  {key === "headingFont" ? "Heading font" : "Body font"}
                </label>
                <select
                  value={styleConfig[key]}
                  onChange={(e) => onStyleChange({ ...styleConfig, [key]: e.target.value })}
                  className="w-full cursor-pointer rounded-xl border border-line-strong bg-bg px-3 py-2.5 text-[12px] text-ink outline-none focus:border-violet/60"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-3 block text-[9px] font-black tracking-widest text-ink-faint uppercase">Global scale</label>
            <div className="flex gap-2">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onStyleChange({ ...styleConfig, fontSize: s.id })}
                  className={`flex-1 rounded-xl border py-2.5 text-[10px] font-bold transition-all ${
                    styleConfig.fontSize === s.id ? "border-violet/40 bg-violet/15 text-violet-bright" : "border-line bg-white/[0.02] text-ink-faint hover:text-ink-soft"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-[9px] font-black tracking-widest text-ink-faint uppercase">Section spacing</label>
            <input
              type="range" min={0.75} max={2.5} step={0.25}
              value={styleConfig.sectionSpacing}
              onChange={(e) => onStyleChange({ ...styleConfig, sectionSpacing: Number(e.target.value) })}
              className="w-full accent-violet"
            />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={Palette} title="Brand accent" />
        <div className="grid grid-cols-4 gap-4 rounded-2xl border border-line bg-white/[0.02] p-5">
          {COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => onStyleChange({ ...styleConfig, primaryColor: c.value })}
              title={c.name}
              className={`grid h-10 w-10 place-items-center rounded-xl transition-all ${
                styleConfig.primaryColor === c.value ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-bg-elevated" : "opacity-60 hover:scale-105 hover:opacity-100"
              }`}
              style={{ backgroundColor: c.value }}
            >
              {styleConfig.primaryColor === c.value && <Check size={18} weight="bold" className="text-white drop-shadow" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
