"use client";

import { FileMagnifyingGlass } from "@phosphor-icons/react";
import Placeholder from "@/components/app/Placeholder";

export default function Page() {
  return (
    <Placeholder
      title="Resume Analyzer"
      icon={FileMagnifyingGlass}
      blurb="ATS scoring and a resume builder with export are being brought to the web app."
    />
  );
}
