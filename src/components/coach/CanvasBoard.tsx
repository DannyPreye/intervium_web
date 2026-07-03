"use client";

import React, { useEffect, useRef } from "react";

export interface Shape {
  kind: "rect" | "circle" | "line" | "arrow" | "text";
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  w?: number;
  h?: number;
  r?: number;
  text?: string;
  color?: string;
}

const W = 600;
const H = 400;

const palette = (name?: string): string => {
  switch ((name || "").toLowerCase()) {
    case "accent":
      return "#a98bff";
    case "primary":
      return "#7c5cff";
    case "muted":
      return "#8b90a6";
    case "good":
      return "#34d399";
    case "bad":
      return "#f87171";
    case "":
    case undefined:
      return "#e6e8f0";
    default:
      return name as string;
  }
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Renders Sage's illustration onto a canvas, animating each shape as if
 *  sketched by hand. Newly appended shapes animate; the picture grows step by step. */
export default function CanvasBoard({ shapes, animate = true }: { shapes: Shape[]; animate?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const prevRef = useRef<Shape[]>([]);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const prepText = () => {
      ctx.font = '600 15px "Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif';
      ctx.textBaseline = "middle";
    };

    const drawShape = (s: Shape, t: number) => {
      const color = palette(s.color);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const dash = (len: number) => {
        ctx.setLineDash([len]);
        ctx.lineDashOffset = len * (1 - t);
      };
      const clearDash = () => {
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
      };
      const labelAlpha = clamp01((t - 0.55) / 0.45);

      switch (s.kind) {
        case "rect": {
          const x = s.x ?? 0, y = s.y ?? 0, w = s.w ?? 80, h = s.h ?? 48;
          const r = Math.min(8, w / 2, h / 2);
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
          else ctx.rect(x, y, w, h);
          dash(2 * (w + h));
          ctx.stroke();
          clearDash();
          if (s.text && labelAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = labelAlpha;
            ctx.textAlign = "center";
            ctx.fillText(s.text, x + w / 2, y + h / 2, w - 8);
            ctx.restore();
          }
          break;
        }
        case "circle": {
          const x = s.x ?? 0, y = s.y ?? 0, r = s.r ?? 28;
          ctx.beginPath();
          ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2);
          dash(2 * Math.PI * r);
          ctx.stroke();
          clearDash();
          if (s.text && labelAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = labelAlpha;
            ctx.textAlign = "center";
            ctx.fillText(s.text, x, y, r * 1.8);
            ctx.restore();
          }
          break;
        }
        case "line":
        case "arrow": {
          const x1 = s.x ?? 0, y1 = s.y ?? 0, x2 = s.x2 ?? x1, y2 = s.y2 ?? y1;
          const len = Math.hypot(x2 - x1, y2 - y1);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          dash(len);
          ctx.stroke();
          clearDash();
          if (s.kind === "arrow" && t > 0.92) {
            const a = Math.atan2(y2 - y1, x2 - x1);
            const head = 9;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - head * Math.cos(a - Math.PI / 6), y2 - head * Math.sin(a - Math.PI / 6));
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - head * Math.cos(a + Math.PI / 6), y2 - head * Math.sin(a + Math.PI / 6));
            ctx.stroke();
          }
          break;
        }
        case "text": {
          ctx.save();
          ctx.globalAlpha = clamp01(t);
          ctx.textAlign = "left";
          ctx.fillText(s.text || "", s.x ?? 0, s.y ?? 0);
          ctx.restore();
          break;
        }
      }
    };

    const renderUpTo = (count: number) => {
      ctx.clearRect(0, 0, W, H);
      prepText();
      for (let i = 0; i < count && i < shapes.length; i++) drawShape(shapes[i], 1);
    };

    const prev = prevRef.current;
    let common = 0;
    while (common < prev.length && common < shapes.length && JSON.stringify(prev[common]) === JSON.stringify(shapes[common]))
      common++;
    prevRef.current = shapes;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (!animate || common >= shapes.length) {
      renderUpTo(shapes.length);
      return;
    }

    let idx = common;
    const perShape = Math.max(140, Math.min(480, 2000 / (shapes.length - idx)));
    let start: number | null = null;
    const frame = (ts: number) => {
      if (start === null) start = ts;
      const t = easeInOut(clamp01((ts - start) / perShape));
      renderUpTo(idx);
      prepText();
      drawShape(shapes[idx], t);
      if (t >= 1) {
        idx += 1;
        start = null;
        if (idx >= shapes.length) {
          renderUpTo(shapes.length);
          rafRef.current = undefined;
          return;
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [shapes, animate]);

  return (
    <canvas
      ref={ref}
      className="w-full rounded-xl border border-line bg-bg-raised"
      style={{ aspectRatio: `${W} / ${H}` }}
    />
  );
}
