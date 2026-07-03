"use client";

import React, { useEffect, useRef } from "react";

let initialized = false;

function animateSvg(svg: SVGSVGElement) {
  const strokes = svg.querySelectorAll<SVGGeometryElement>("path, line, polyline");
  strokes.forEach((el, i) => {
    let len = 0;
    try {
      len = el.getTotalLength?.() ?? 0;
    } catch {
      len = 0;
    }
    if (!len || !isFinite(len)) return;
    const delay = 100 + i * 80;
    el.style.transition = "none";
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    void el.getBoundingClientRect();
    el.style.transition = `stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`;
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = "0";
    });
  });
  const fades = svg.querySelectorAll<SVGElement>(
    ".node, .cluster, .label, .edgeLabel, .nodeLabel, text, foreignObject, .actor, .messageText, .note"
  );
  fades.forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transition = `opacity 420ms ease ${180 + i * 60}ms`;
    requestAnimationFrame(() => {
      el.style.opacity = "1";
    });
  });
}

/** Renders a Mermaid diagram string to inline SVG, drawn progressively.
 *  Mermaid is imported lazily inside the effect so it never runs during SSR. */
export default function MermaidDiagram({ code, animate = true }: { code: string; animate?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mmd-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      if (!initialized) {
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "dark" });
        initialized = true;
      }
      try {
        const { svg } = await mermaid.render(idRef.current, code);
        if (cancelled) return;
        const host = hostRef.current;
        if (!host) return;
        host.innerHTML = svg;
        const svgEl = host.querySelector("svg");
        if (svgEl && animate) {
          try {
            animateSvg(svgEl);
          } catch {}
        }
      } catch {
        if (!cancelled && hostRef.current) hostRef.current.innerHTML = "";
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, animate]);

  return (
    <div
      ref={hostRef}
      className="overflow-auto rounded-xl border border-line bg-bg-raised p-3 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
    />
  );
}
