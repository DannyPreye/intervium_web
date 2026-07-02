// Icon + logo generator for Intavue (web + desktop), powered by `sharp`.
//
//   node scripts/generate-icons.mjs
//
// Produces from two source SVGs:
//   • a colored app-icon "tile"  → every square slot (favicon, PWA, app icon,
//     Electron window icon) plus multi-size .ico and .icns (packed by hand, so
//     no extra dependencies are needed)
//   • a white "mark + Intavue wordmark" lockup → the wide in-app / nav logos
//
// Run from the web/ directory (sharp is installed there).

import sharp from 'sharp'
import { Buffer } from 'node:buffer'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const DESKTOP = path.resolve(WEB, '..', 'desktop')

/* ── Brand mark: a speech bubble (the interview) whose interior shows three
   ascending bars (voice → measurable improvement). Cut out as holes so the
   silhouette reads in one color. ───────────────────────────────────────── */
const BUBBLE = `
  <rect x="116" y="118" width="280" height="206" rx="52" fill="#fff"/>
  <path d="M170 300 L170 384 L250 316 Z" fill="#fff"/>`
const BAR_HOLES = `
  <rect x="180" y="230" width="34" height="62"  rx="17" fill="#000"/>
  <rect x="239" y="196" width="34" height="96"  rx="17" fill="#000"/>
  <rect x="298" y="160" width="34" height="132" rx="17" fill="#000"/>`

// Colored app-icon tile (512 canvas).
const TILE_SVG = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="48" y1="24" x2="470" y2="488" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8B7BFF"/>
      <stop offset="0.52" stop-color="#5B49F0"/>
      <stop offset="1" stop-color="#3E30B8"/>
    </linearGradient>
    <radialGradient id="hi" cx="150" cy="120" r="360" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cy" cx="470" cy="500" r="380" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#22D3EE" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#22D3EE" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="118" fill="url(#bg)"/>
  <rect width="512" height="512" rx="118" fill="url(#cy)"/>
  <rect width="512" height="512" rx="118" fill="url(#hi)"/>
  ${BUBBLE}
  <rect x="180" y="230" width="34" height="62"  rx="17" fill="#5A4AE6"/>
  <rect x="239" y="196" width="34" height="96"  rx="17" fill="#6E67F3"/>
  <rect x="298" y="160" width="34" height="132" rx="17" fill="#22D3EE"/>
</svg>`

// Monochrome white mark (holes let the background show through the bars).
const MARK_SVG = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="m">${BUBBLE}${BAR_HOLES}</mask>
  </defs>
  <rect width="512" height="512" fill="#ffffff" mask="url(#m)"/>
</svg>`

// Wide lockup: white mark + "Intavue" wordmark (kept at the current 669x373 so
// no layout changes are needed; every slot forces it white or shows it on dark).
const LOCKUP_W = 669
const LOCKUP_H = 373
const LOCKUP_SVG = `<svg width="${LOCKUP_W}" height="${LOCKUP_H}" viewBox="0 0 ${LOCKUP_W} ${LOCKUP_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="m">
      <g transform="translate(28,72) scale(0.44)">${BUBBLE}${BAR_HOLES}</g>
    </mask>
  </defs>
  <rect width="${LOCKUP_W}" height="${LOCKUP_H}" fill="#ffffff" mask="url(#m)"/>
  <text x="270" y="212" font-family="'Bricolage Grotesque','Segoe UI',Arial,sans-serif"
        font-size="104" font-weight="700" letter-spacing="-4" fill="#ffffff">Intavue</text>
</svg>`

const png = (svg, size) =>
  sharp(Buffer.from(svg)).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()

/* ── .ico (PNG-compressed entries; read by every modern OS) ──────────────── */
async function buildIco(svg, sizes) {
  const imgs = await Promise.all(sizes.map(async (s) => ({ s, buf: await png(svg, s) })))
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(imgs.length, 4)
  let offset = 6 + imgs.length * 16
  const dir = []
  for (const { s, buf } of imgs) {
    const d = Buffer.alloc(16)
    d.writeUInt8(s >= 256 ? 0 : s, 0)
    d.writeUInt8(s >= 256 ? 0 : s, 1)
    d.writeUInt16LE(1, 4)
    d.writeUInt16LE(32, 6)
    d.writeUInt32LE(buf.length, 8)
    d.writeUInt32LE(offset, 12)
    offset += buf.length
    dir.push(d)
  }
  return Buffer.concat([header, ...dir, ...imgs.map((i) => i.buf)])
}

/* ── .icns (PNG-based OSType entries) ────────────────────────────────────── */
async function buildIcns(svg) {
  const map = [
    ['ic10', 1024], ['ic09', 512], ['ic08', 256], ['ic07', 128], ['ic12', 64], ['ic11', 32]
  ]
  const parts = []
  for (const [type, size] of map) {
    const buf = await png(svg, size)
    const head = Buffer.alloc(8)
    head.write(type, 0, 'ascii')
    head.writeUInt32BE(buf.length + 8, 4)
    parts.push(head, buf)
  }
  const body = Buffer.concat(parts)
  const header = Buffer.alloc(8)
  header.write('icns', 0, 'ascii')
  header.writeUInt32BE(body.length + 8, 4)
  return Buffer.concat([header, body])
}

const out = async (p, buf) => {
  await mkdir(path.dirname(p), { recursive: true })
  await writeFile(p, buf)
  console.log('✓', path.relative(path.resolve(WEB, '..'), p))
}

/* ── Generate ────────────────────────────────────────────────────────────── */
// Square app-icon tile
await out(path.join(WEB, 'public/intavue-app-icon.png'), await png(TILE_SVG, 1024))
await out(path.join(WEB, 'src/app/icon.png'), await png(TILE_SVG, 512))
await out(path.join(WEB, 'public/favicon.ico'), await buildIco(TILE_SVG, [16, 32, 48, 64, 128, 256]))
await out(path.join(DESKTOP, 'build/icon.png'), await png(TILE_SVG, 1024))
await out(path.join(DESKTOP, 'build/icon.ico'), await buildIco(TILE_SVG, [16, 32, 48, 64, 128, 256]))
await out(path.join(DESKTOP, 'build/icon.icns'), await buildIcns(TILE_SVG))
await out(path.join(DESKTOP, 'resources/icon.png'), await png(TILE_SVG, 512))

// Standalone white mark (symbol only) — paired with live-text wordmarks in the UI.
await out(path.join(WEB, 'public/mark.png'), await png(MARK_SVG, 512))

// Wide logo lockup (white) — kept for slots that expect a baked wordmark.
const lockup = await sharp(Buffer.from(LOCKUP_SVG)).png().toBuffer()
await out(path.join(WEB, 'public/icon.png'), lockup)
await out(path.join(DESKTOP, 'src/renderer/src/assets/logo.png'), lockup)

console.log('\nDone.')
