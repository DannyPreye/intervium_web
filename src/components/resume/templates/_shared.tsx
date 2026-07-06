import React from 'react'
import { StyleConfig } from '../ResumeBuilder'

/**
 * Shared helpers for all resume templates. Previously these were copy-pasted
 * into every template file.
 */

// "#6366f1" -> "99, 102, 241". Falls back to the brand indigo on bad input.
export const toRgb = (hex: string): string => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : '99, 102, 241'
}

export const safeHref = (url: string): string =>
  url.startsWith('http') || url.startsWith('mailto:') || url.startsWith('tel:') ? url : `https://${url}`

export const A: React.FC<{ href: string; children: React.ReactNode; color?: string }> = ({
  href,
  children,
  color
}) => (
  <a href={safeHref(href)} style={{ color: color ?? 'inherit', textDecoration: 'none' }}>
    {children}
  </a>
)

// Font-size control -> a multiplier the templates consume as var(--rs) on every
// hardcoded text size, so the "Font Size" control actually changes the document.
export const fontScale = (size: StyleConfig['fontSize']): number =>
  size === 'small' ? 0.94 : size === 'large' ? 1.16 : 1.04

// CSS variables applied once to the resume container. Every template reads these
// (font size via var(--rs); secondary/meta colour via var(--rs-secondary);
// section spacing via var(--rs-section)) so the style controls are all live.
export const resumeVars = (style: StyleConfig): React.CSSProperties =>
  ({
    ['--rs']: fontScale(style.fontSize),
    ['--rs-secondary']: style.secondaryColor,
    ['--rs-section']: `${style.sectionSpacing}rem`
  }) as React.CSSProperties
