"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PencilSimple, Square, Circle, ArrowUpRight, TextT, Eraser,
  ArrowUUpLeft, ArrowUUpRight, DownloadSimple, ChatCircleText, CircleNotch, X,
} from "@phosphor-icons/react";
import { api, unwrap } from "@/lib/api";

type Pt = { x: number; y: number };
type WbTool = "pen" | "rect" | "ellipse" | "arrow" | "text" | "eraser";

const WB_TOOLS: { id: WbTool; icon: React.ElementType; title: string }[] = [
  { id: "pen", icon: PencilSimple, title: "Pen" },
  { id: "rect", icon: Square, title: "Box (service/component)" },
  { id: "ellipse", icon: Circle, title: "Ellipse" },
  { id: "arrow", icon: ArrowUpRight, title: "Arrow (connection)" },
  { id: "text", icon: TextT, title: "Text label" },
  { id: "eraser", icon: Eraser, title: "Eraser" },
];
const WB_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#111111"];
const WB_WIDTHS = [
  { label: "S", w: 2.5 },
  { label: "M", w: 4 },
  { label: "L", w: 7 },
];
// One-click system-design components. 'db' renders a cylinder, the rest a box.
const WB_STENCILS: { label: string; shape: "box" | "db" }[] = [
  { label: "Client", shape: "box" },
  { label: "Load Balancer", shape: "box" },
  { label: "API", shape: "box" },
  { label: "Service", shape: "box" },
  { label: "Database", shape: "db" },
  { label: "Cache", shape: "db" },
  { label: "Queue", shape: "box" },
  { label: "CDN", shape: "box" },
];

/** System-design whiteboard: freehand pen plus boxes, arrows, text, undo/redo,
 *  one-click component stencils and PNG export. Immediate-mode canvas with an
 *  ImageData undo stack. The drawing is captured as a PNG, described via the
 *  vision endpoint, and handed to Alex over the realtime channel. */
export default function WhiteboardPanel({
  onShare,
  onClose,
}: {
  onShare: (text: string) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const startPt = useRef<Pt | null>(null);
  const lastPt = useRef<Pt | null>(null);
  const baseImage = useRef<ImageData | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);
  const stampRef = useRef(0);

  const [tool, setTool] = useState<WbTool>("pen");
  const [color, setColor] = useState("#6366f1");
  const [width, setWidth] = useState(2.5);
  const [histLen, setHistLen] = useState(0);
  const [redoLen, setRedoLen] = useState(0);
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);
  const [describing, setDescribing] = useState(false);

  const ctxOf = () => canvasRef.current?.getContext("2d") ?? null;

  const paintBackground = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const parent = c.parentElement;
    if (!parent) return;
    c.width = parent.clientWidth;
    c.height = parent.clientHeight;
    const ctx = c.getContext("2d");
    if (ctx) paintBackground(ctx, c.width, c.height);
  }, [paintBackground]);

  const pointFrom = (e: React.PointerEvent): Pt => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (c.width / rect.width),
      y: (e.clientY - rect.top) * (c.height / rect.height),
    };
  };

  const pushHistory = () => {
    const c = canvasRef.current;
    const ctx = ctxOf();
    if (!c || !ctx) return;
    historyRef.current.push(ctx.getImageData(0, 0, c.width, c.height));
    if (historyRef.current.length > 30) historyRef.current.shift();
    redoRef.current = [];
    setHistLen(historyRef.current.length);
    setRedoLen(0);
  };

  const undo = () => {
    const c = canvasRef.current;
    const ctx = ctxOf();
    if (!c || !ctx || !historyRef.current.length) return;
    redoRef.current.push(ctx.getImageData(0, 0, c.width, c.height));
    ctx.putImageData(historyRef.current.pop()!, 0, 0);
    setHistLen(historyRef.current.length);
    setRedoLen(redoRef.current.length);
  };

  const redo = () => {
    const c = canvasRef.current;
    const ctx = ctxOf();
    if (!c || !ctx || !redoRef.current.length) return;
    historyRef.current.push(ctx.getImageData(0, 0, c.width, c.height));
    ctx.putImageData(redoRef.current.pop()!, 0, 0);
    setHistLen(historyRef.current.length);
    setRedoLen(redoRef.current.length);
  };

  const drawShape = (ctx: CanvasRenderingContext2D, a: Pt, b: Pt) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "rect") {
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(b.x - a.x);
      const h = Math.abs(b.y - a.y);
      const r = Math.min(10, w / 2, h / 2);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
      else ctx.rect(x, y, w, h);
      ctx.stroke();
    } else if (tool === "ellipse") {
      ctx.beginPath();
      ctx.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === "arrow") {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const head = 12 + width * 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - head * Math.cos(ang - Math.PI / 6), b.y - head * Math.sin(ang - Math.PI / 6));
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - head * Math.cos(ang + Math.PI / 6), b.y - head * Math.sin(ang + Math.PI / 6));
      ctx.stroke();
    }
  };

  const onDown = (e: React.PointerEvent) => {
    if (tool === "text") {
      const p = pointFrom(e);
      setTextInput({ x: p.x, y: p.y, value: "" });
      return;
    }
    const ctx = ctxOf();
    if (!ctx) return;
    pushHistory();
    drawing.current = true;
    const p = pointFrom(e);
    startPt.current = p;
    lastPt.current = p;
    if (tool === "rect" || tool === "ellipse" || tool === "arrow") {
      const c = canvasRef.current!;
      baseImage.current = ctx.getImageData(0, 0, c.width, c.height);
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = ctxOf();
    if (!ctx) return;
    const p = pointFrom(e);
    if (tool === "pen" || tool === "eraser") {
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth = tool === "eraser" ? Math.max(18, width * 6) : width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPt.current!.x, lastPt.current!.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastPt.current = p;
    } else if (baseImage.current && startPt.current) {
      ctx.putImageData(baseImage.current, 0, 0);
      drawShape(ctx, startPt.current, p);
    }
  };

  const onUp = () => {
    drawing.current = false;
    startPt.current = null;
    lastPt.current = null;
    baseImage.current = null;
  };

  const commitText = () => {
    const ti = textInput;
    setTextInput(null);
    if (!ti || !ti.value.trim()) return;
    const ctx = ctxOf();
    if (!ctx) return;
    pushHistory();
    const fs = width <= 2.5 ? 16 : width <= 4 ? 20 : 26;
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `600 ${fs}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(ti.value, ti.x, ti.y);
  };

  const insertStencil = (label: string, shape: "box" | "db") => {
    const ctx = ctxOf();
    if (!ctx) return;
    pushHistory();
    const n = stampRef.current++;
    const x = 40 + (n % 5) * 30;
    const y = 40 + (n % 5) * 30;
    const w = 150;
    const h = 64;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (shape === "db") {
      const ry = 9;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + ry, w / 2, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + ry);
      ctx.lineTo(x, y + h - ry);
      ctx.moveTo(x + w, y + ry);
      ctx.lineTo(x + w, y + h - ry);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h - ry, w / 2, ry, 0, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, 10);
      else ctx.rect(x, y, w, h);
      ctx.stroke();
    }
    ctx.font = '600 15px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + w / 2, y + h / 2, w - 16);
    ctx.textAlign = "left";
  };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = ctxOf();
    if (!c || !ctx) return;
    pushHistory();
    paintBackground(ctx, c.width, c.height);
    stampRef.current = 0;
  };

  const exportPng = () => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
  };

  const discuss = async () => {
    const c = canvasRef.current;
    if (!c || describing) return;
    setDescribing(true);
    try {
      const base64 = c.toDataURL("image/png").split(",")[1];
      const r = unwrap<{ description?: string }>(
        await api("/v1/user/analyze-screenshot", { method: "POST", body: { image: base64 } })
      );
      const description = r?.description || "a system design diagram";
      onShare(`[My system design diagram]\nHere's what I sketched on the whiteboard: ${description}`);
    } catch {
      onShare(`[My system design diagram]\nI've sketched a system design on the whiteboard — let me walk you through it.`);
    } finally {
      setDescribing(false);
    }
  };

  const iconBtn = "grid h-7 w-7 place-items-center rounded-md border transition-all disabled:opacity-30";

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-bg-elevated">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-line px-3 py-2">
        <span className="text-[12px] font-semibold text-ink">System design</span>
        <button onClick={onClose} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md border border-line-strong bg-bg-raised text-ink-faint hover:text-ink">
          <X size={13} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-3 py-2">
        <div className="flex items-center gap-0.5">
          {WB_TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.title}
              className={`${iconBtn} ${tool === t.id ? "border-violet/40 bg-violet/15 text-violet-bright" : "border-transparent text-ink-faint hover:text-ink"}`}
            >
              <t.icon size={14} />
            </button>
          ))}
        </div>
        <span className="h-4 w-px bg-line-strong" />
        <div className="flex items-center gap-1">
          {WB_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} title="Color" className={`h-4 w-4 rounded-full border ${color === c ? "border-ink" : "border-line-strong"}`} style={{ background: c }} />
          ))}
        </div>
        <span className="h-4 w-px bg-line-strong" />
        <div className="flex items-center gap-0.5">
          {WB_WIDTHS.map((x) => (
            <button
              key={x.label}
              onClick={() => setWidth(x.w)}
              title={`${x.label} stroke`}
              className={`h-7 w-6 rounded-md border text-[10px] font-bold transition-all ${width === x.w ? "border-violet/40 bg-violet/15 text-violet-bright" : "border-transparent text-ink-faint hover:text-ink"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
        <span className="h-4 w-px bg-line-strong" />
        <button onClick={undo} disabled={!histLen} title="Undo" className={`${iconBtn} border-transparent text-ink-faint hover:text-ink`}>
          <ArrowUUpLeft size={14} />
        </button>
        <button onClick={redo} disabled={!redoLen} title="Redo" className={`${iconBtn} border-transparent text-ink-faint hover:text-ink`}>
          <ArrowUUpRight size={14} />
        </button>
        <button
          onClick={discuss}
          disabled={describing}
          title="Send your diagram to Alex"
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-[var(--cta)] px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-40"
        >
          {describing ? <CircleNotch size={12} className="animate-spin" /> : <ChatCircleText size={12} weight="fill" />}
          {describing ? "Sharing…" : "Discuss"}
        </button>
      </div>

      {/* Stencils + actions */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line px-3 py-2">
        <span className="text-[10px] font-bold tracking-widest text-ink-faint/60 uppercase">Insert</span>
        {WB_STENCILS.map((s) => (
          <button
            key={s.label}
            onClick={() => insertStencil(s.label, s.shape)}
            className="rounded-md border border-line-strong bg-bg-raised px-2 py-1 text-[11px] font-medium text-ink-soft transition-all hover:border-violet/40 hover:text-violet-bright"
          >
            {s.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={exportPng} title="Download as PNG" className="flex items-center gap-1 rounded-md border border-line-strong bg-bg-raised px-2 py-1 text-[11px] font-medium text-ink-soft transition-all hover:text-ink">
            <DownloadSimple size={12} /> Save
          </button>
          <button onClick={clear} className="rounded-md border border-line-strong bg-bg-raised px-2 py-1 text-[11px] font-medium text-ink-soft transition-all hover:text-ink">
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className={`h-full w-full touch-none ${tool === "text" ? "cursor-text" : "cursor-crosshair"}`}
        />
        {textInput && (
          <input
            autoFocus
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitText();
              else if (e.key === "Escape") setTextInput(null);
            }}
            onBlur={commitText}
            style={{ left: textInput.x, top: textInput.y }}
            className="absolute z-10 rounded border border-violet/50 bg-white px-1 text-[15px] text-black shadow outline-none"
            placeholder="Label…"
          />
        )}
      </div>
    </div>
  );
}
