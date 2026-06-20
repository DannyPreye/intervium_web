import fs from 'fs';
import path from 'path';

const PAGE_FILE = 'c:/Users/olawo/Desktop/projects/intavue/web/src/app/page.tsx';
const OUT_DIR = 'c:/Users/olawo/Desktop/projects/intavue/web/src';

const content = fs.readFileSync(PAGE_FILE, 'utf-8');
const lines = content.split('\n');

function getLines(startMarker, endMarker, includeStart = false, includeEnd = false) {
  let startIdx = lines.findIndex(l => l.includes(startMarker));
  let endIdx = lines.findIndex((l, i) => i > startIdx && l.includes(endMarker));
  if (startIdx === -1 || endIdx === -1) return [];
  return lines.slice(startIdx + (includeStart ? 0 : 1), endIdx + (includeEnd ? 1 : 0));
}

function getLinesRange(startLineIdx, endLineIdx) {
  return lines.slice(startLineIdx, endLineIdx + 1);
}

// Ensure dirs exist
['lib', 'components/ui', 'components/landing'].forEach(d => {
  fs.mkdirSync(path.join(OUT_DIR, d), { recursive: true });
});

// 1. types.ts
const typesLines = getLinesRange(29, 36); // from type OS to interface ReleaseAssets
fs.writeFileSync(path.join(OUT_DIR, 'lib/types.ts'), typesLines.join('\n') + '\n');

// 2. constants.ts
// GITHUB... OS_META...
const constantsLines1 = getLinesRange(39, 54);
// STEALTH to REQUIREMENTS
const constantsLines2 = getLinesRange(353, 533);
const constantsContent = `import {
  EyeSlash,
  CursorClick,
  Lightning,
  ShieldCheck,
  MicrophoneStage,
  FileMagnifyingGlass,
  ChatTeardropText,
  BookOpen,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";
import { OS } from "./types";

${constantsLines1.join('\n')}

${constantsLines2.join('\n')}
`;
fs.writeFileSync(path.join(OUT_DIR, 'lib/constants.ts'), constantsContent);

// 3. hooks.ts
const hooksLines1 = getLinesRange(56, 102); // fetchReleaseAssets to useOS
const hooksLines2 = getLinesRange(138, 142); // useDownloadHref
const hooksContent = `import { useSyncExternalStore } from "react";
import { OS, ReleaseAssets } from "./types";
import { GITHUB_API_LATEST, GITHUB_RELEASES } from "./constants";

${hooksLines1.join('\n').replace(/function fetch/, 'export async function fetch').replace(/function detect/, 'export function detect').replace(/function useOS/, 'export function useOS')}

${hooksLines2.join('\n').replace(/function useDownload/, 'export function useDownload')}
`;
fs.writeFileSync(path.join(OUT_DIR, 'lib/hooks.ts'), hooksContent);

// 4. components/ui/OsGlyph.tsx
const osGlyphLines = getLinesRange(104, 109);
const osGlyphContent = `import React from "react";
import {
  WindowsLogo as WindowsLogoIcon,
  AppleLogo as AppleLogoIcon,
  LinuxLogo as LinuxLogoIcon,
  DownloadSimple as DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { OS } from "@/lib/types";

${osGlyphLines.join('\n').replace(/function OsGlyph/, 'export default function OsGlyph')}
`;
fs.writeFileSync(path.join(OUT_DIR, 'components/ui/OsGlyph.tsx'), osGlyphContent);

// 5. components/ui/Reveal.tsx
const revealLines = getLinesRange(112, 135);
const revealContent = `"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

${revealLines.join('\n').replace(/function Reveal/, 'export default function Reveal')}
`;
fs.writeFileSync(path.join(OUT_DIR, 'components/ui/Reveal.tsx'), revealContent);

// 6. components/ui/DownloadCTA.tsx
const downloadCTALines = getLinesRange(145, 172);
const downloadCTAContent = `"use client";

import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { ReleaseAssets } from "@/lib/types";
import { useOS } from "@/lib/hooks";
import { GITHUB_RELEASES, OS_META } from "@/lib/constants";
import OsGlyph from "./OsGlyph";

${downloadCTALines.join('\n').replace(/function DownloadCTA/, 'export default function DownloadCTA')}
`;
fs.writeFileSync(path.join(OUT_DIR, 'components/ui/DownloadCTA.tsx'), downloadCTAContent);

console.log("Extraction step 1 completed.");
