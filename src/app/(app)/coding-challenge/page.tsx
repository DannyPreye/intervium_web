"use client";

import { Code } from "@phosphor-icons/react";
import Placeholder from "@/components/app/Placeholder";

export default function Page() {
  return (
    <Placeholder
      title="Coding Challenge"
      icon={Code}
      blurb="Role-tailored coding problems with an in-browser editor and AI review, coming to the web app."
    />
  );
}
