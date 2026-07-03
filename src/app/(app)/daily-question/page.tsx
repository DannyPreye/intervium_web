"use client";

import { CalendarBlank } from "@phosphor-icons/react";
import Placeholder from "@/components/app/Placeholder";

export default function Page() {
  return (
    <Placeholder
      title="Daily Question"
      icon={CalendarBlank}
      blurb="A fresh interview question each day with AI feedback and a streak, coming to the web app."
    />
  );
}
