import React from "react";

/* CSS-only reveal — server-component compatible (no motion library). Elements
 * fade/rise in on load with an optional staggered delay. Default state is fully
 * visible, so with reduced-motion or if animations don't run, content still shows. */
export default function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const style: React.CSSProperties = {};
  if (delay) style.animationDelay = `${delay}s`;
  if (y !== 22) (style as Record<string, string>)["--reveal-y"] = `${y}px`;
  return (
    <div className={`reveal${className ? ` ${className}` : ""}`} style={Object.keys(style).length ? style : undefined}>
      {children}
    </div>
  );
}
