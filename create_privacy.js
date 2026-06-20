const fs = require('fs');
const path = require('path');

const licenseTxt = fs.readFileSync(path.join(__dirname, '../../desktop/build/license.txt'), 'utf8');

// Parse the text into sections
const lines = licenseTxt.split('\n');

let htmlContent = '';
let inSection = false;

for (let line of lines) {
  line = line.trimEnd();
  if (line === '') {
    htmlContent += '<br />\n';
    continue;
  }
  
  if (line.match(/^SECTION \d+:/)) {
    htmlContent += `<h2 className="mt-12 mb-6 font-display text-2xl font-bold text-ink">{
      \`${line.replace(/'/g, "\\'")}\`
    }</h2>\n`;
    continue;
  }
  
  if (line.match(/^\d+\.\d+\s/)) {
    htmlContent += `<h3 className="mt-8 mb-4 font-display text-xl font-semibold text-ink">{
      \`${line.replace(/'/g, "\\'")}\`
    }</h3>\n`;
    continue;
  }
  
  if (line.match(/^[A-Z\s\-]+$/) && line.length > 10 && !line.includes('THE SOFTWARE')) {
    // Main Title
    htmlContent += `<h1 className="mb-8 font-display text-4xl font-extrabold text-ink">{
      \`${line.replace(/'/g, "\\'")}\`
    }</h1>\n`;
    continue;
  }
  
  if (line.startsWith('- ')) {
    htmlContent += `<li className="ml-6 mb-2 list-disc">{
      \`${line.substring(2).replace(/'/g, "\\'")}\`
    }</li>\n`;
    continue;
  }
  
  htmlContent += `<p className="mb-4">{
    \`${line.replace(/'/g, "\\'")}\`
  }</p>\n`;
}

const componentCode = \`"use client";
import React, { useEffect, useState } from "react";
import { ReleaseAssets } from "@/lib/types";
import { fetchReleaseAssets } from "@/lib/hooks";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PrivacyPage() {
  const [assets, setAssets] = useState<ReleaseAssets>({
    windows: null,
    mac: null,
    linux: null,
    version: null,
  });

  useEffect(() => {
    fetchReleaseAssets().then(setAssets);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-bg text-ink-soft">
      <Navbar assets={assets} />
      
      <main className="container-x mx-auto max-w-4xl py-32 md:py-40">
        <div className="rounded-2xl border border-line bg-bg-elevated/40 p-8 shadow-sm md:p-12">
          \${htmlContent}
        </div>
      </main>

      <Footer assets={assets} />
    </div>
  );
}
\`;

const outDir = path.join(__dirname, 'src/app/privacy');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'page.tsx'), componentCode);
console.log('Created src/app/privacy/page.tsx');
