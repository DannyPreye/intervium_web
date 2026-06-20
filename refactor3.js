const fs = require('fs');
const path = require('path');

const PAGE_FILE = path.join(__dirname, 'page-original.tsx');
const OUT_DIR = path.join(__dirname, 'src');

const content = fs.readFileSync(PAGE_FILE, 'utf-8');

const writeComponent = (name, sectionId, imports, props = "") => {
  let startIdx = content.indexOf('id="' + sectionId + '"');
  if (startIdx === -1 && sectionId === 'hero') startIdx = content.indexOf('pt-28 pb-20 md:pt-36 md:pb-28');
  if (startIdx === -1 && sectionId === 'compatibility') startIdx = content.indexOf('bg-bg-elevated/40">');
  if (startIdx === -1 && sectionId === 'cta') startIdx = content.indexOf('border-t border-line py-28');
  if (startIdx === -1 && sectionId === 'footer') startIdx = content.indexOf('<footer');
  
  if (startIdx === -1) {
    console.error('Could not find start for', name);
    return;
  }
  
  let actualStart = content.lastIndexOf('<section', startIdx);
  if (sectionId === 'footer') actualStart = content.lastIndexOf('<footer', startIdx);
  
  let endTag = sectionId === 'footer' ? '</footer>' : '</section>';
  let actualEnd = content.indexOf(endTag, actualStart) + endTag.length;
  
  let compBody = content.substring(actualStart, actualEnd);
  
  const code = '"use client";\n\nimport React from "react";\n' + imports + '\n\nexport default function ' + name + '(' + props + ') {\n  return (\n' + compBody + '\n  );\n}\n';
  fs.writeFileSync(path.join(OUT_DIR, 'components/landing/' + name + '.tsx'), code);
}

const navbarPath = path.join(OUT_DIR, 'components/landing/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf-8');
if (!navbarContent.trim().endsWith('}')) {
    navbarContent += '\n  );\n}\n';
    fs.writeFileSync(navbarPath, navbarContent);
}

writeComponent('HeroSection', 'hero', 
  'import Image from "next/image";\nimport { Sparkle, EyeSlash } from "@phosphor-icons/react";\nimport { ReleaseAssets } from "@/lib/types";\nimport DownloadCTA from "@/components/ui/DownloadCTA";',
  '{ assets }: { assets: ReleaseAssets }'
);

writeComponent('CompatibilitySection', 'compatibility',
  'import { SHARE_PLATFORMS } from "@/lib/constants";'
);

writeComponent('StealthSection', 'stealth',
  'import { STEALTH } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";\nimport { EyeSlash, CursorClick, Lightning, ShieldCheck } from "@phosphor-icons/react";'
);

writeComponent('FeaturesSection', 'features',
  'import { FEATURES } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";\nimport { MicrophoneStage, FileMagnifyingGlass, ChatTeardropText, BookOpen } from "@phosphor-icons/react";'
);

writeComponent('HowItWorksSection', 'how',
  'import { STEPS } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";'
);

writeComponent('PricingSection', 'pricing',
  'import { ArrowRight, Check } from "@phosphor-icons/react";\nimport { PLANS } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";',
  '{ downloadHref }: { downloadHref: string }'
);

writeComponent('FAQSection', 'faq',
  'import { CaretDown } from "@phosphor-icons/react";\nimport { FAQ } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";'
);

writeComponent('RequirementsSection', 'requirements',
  'import { EyeSlash } from "@phosphor-icons/react";\nimport { REQUIREMENTS } from "@/lib/constants";\nimport Reveal from "@/components/ui/Reveal";\nimport OsGlyph from "@/components/ui/OsGlyph";'
);

writeComponent('CTASection', 'cta',
  'import { ReleaseAssets } from "@/lib/types";\nimport Reveal from "@/components/ui/Reveal";\nimport DownloadCTA from "@/components/ui/DownloadCTA";',
  '{ assets }: { assets: ReleaseAssets }'
);

writeComponent('Footer', 'footer',
  'import Image from "next/image";\nimport { GITHUB_RELEASES } from "@/lib/constants";'
);

console.log("Extraction step 3 completed.");
