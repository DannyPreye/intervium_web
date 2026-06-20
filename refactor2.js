import fs from 'fs';
import path from 'path';

const PAGE_FILE = 'c:/Users/olawo/Desktop/projects/intavue/web/src/app/page.tsx';
const OUT_DIR = 'c:/Users/olawo/Desktop/projects/intavue/web/src';

const content = fs.readFileSync(PAGE_FILE, 'utf-8');
const lines = content.split('\n');

function getLinesRange(startLineIdx, endLineIdx) {
  // startLineIdx and endLineIdx are 1-based
  return lines.slice(startLineIdx - 1, endLineIdx);
}

const writeComponent = (name, start, end, imports, props = "") => {
  const compLines = getLinesRange(start, end);
  let compBody = compLines.join('\n');
  const code = `"use client";\n\nimport React from "react";\n${imports}\n\nexport default function ${name}(${props}) {\n  return (\n${compBody}\n  );\n}\n`;
  fs.writeFileSync(path.join(OUT_DIR, 'components/landing/' + name + '.tsx'), code);
}

// 7. Navbar.tsx (Lines 184-351)
const navbarLines = getLinesRange(184, 351).join('\n');
const navbarCode = `"use client";\n\nimport React, { useEffect, useRef, useState } from "react";\nimport Image from "next/image";\nimport { CaretDown, List, X } from "@phosphor-icons/react";\nimport { ReleaseAssets, OS } from "@/lib/types";\nimport { useOS } from "@/lib/hooks";\nimport { GITHUB_RELEASES, OS_META } from "@/lib/constants";\nimport OsGlyph from "@/components/ui/OsGlyph";\n\nconst NAV_LINKS = [\n  { href: "#stealth", label: "Stealth" },\n  { href: "#features", label: "Features" },\n  { href: "#how", label: "How it works" },\n  { href: "#pricing", label: "Pricing" },\n  { href: "#faq", label: "FAQ" },\n];\n\n${navbarLines.replace(/function Navbar/, 'export default function Navbar')}\n`;
fs.writeFileSync(path.join(OUT_DIR, 'components/landing/Navbar.tsx'), navbarCode);

// 8. HeroSection.tsx (Lines 555-616)
writeComponent('HeroSection', 555, 616, 
  `import Image from "next/image";\nimport { Sparkle, EyeSlash } from "@phosphor-icons/react";\nimport { ReleaseAssets } from "@/lib/types";\nimport DownloadCTA from "@/components/ui/DownloadCTA";`,
  `{ assets }: { assets: ReleaseAssets }`
);

// 9. CompatibilitySection.tsx (Lines 618-638)
writeComponent('CompatibilitySection', 618, 638,
  `import { SHARE_PLATFORMS } from "@/lib/constants";`
);

// 10. StealthSection.tsx (Lines 640-685)
writeComponent('StealthSection', 640, 685,
  `import { STEALTH } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";`
);

// 11. FeaturesSection.tsx (Lines 687-737)
writeComponent('FeaturesSection', 687, 737,
  `import { FEATURES } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";`
);

// 12. HowItWorksSection.tsx (Lines 739-773)
writeComponent('HowItWorksSection', 739, 773,
  `import { STEPS } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";`
);

// 13. PricingSection.tsx (Lines 775-853)
writeComponent('PricingSection', 775, 853,
  `import { ArrowRight, Check } from "@phosphor-icons/react";\nimport { PLANS } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";`,
  `{ downloadHref }: { downloadHref: string }`
);

// 14. FAQSection.tsx (Lines 855-891)
writeComponent('FAQSection', 855, 891,
  `import { CaretDown } from "@phosphor-icons/react";\nimport { FAQ } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";`
);

// 15. RequirementsSection.tsx (Lines 893-958)
writeComponent('RequirementsSection', 893, 958,
  `import { EyeSlash } from "@phosphor-icons/react";\nimport { REQUIREMENTS } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";\nimport OsGlyph from "@/components/ui/OsGlyph";`
);

// 16. CTASection.tsx (Lines 960-982)
writeComponent('CTASection', 960, 982,
  `import { ReleaseAssets } from "@/lib/types";\nimport Reveal from "@/components/ui/Reveal";\nimport DownloadCTA from "@/components/ui/DownloadCTA";`,
  `{ assets }: { assets: ReleaseAssets }`
);

// 17. Footer.tsx (Lines 984-1024)
writeComponent('Footer', 984, 1024,
  `import Image from "next/image";\nimport { GITHUB_RELEASES } from "@/lib/constants";`
);

console.log("Extraction step 2 completed.");
