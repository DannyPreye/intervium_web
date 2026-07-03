"use client";

import { BookOpen } from "@phosphor-icons/react";
import Placeholder from "@/components/app/Placeholder";

export default function Page() {
  return (
    <Placeholder
      title="Story Bank"
      icon={BookOpen}
      blurb="Save STAR-format stories the AI draws on across your prep. Coming to the web app."
    />
  );
}
