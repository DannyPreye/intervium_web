"use client";

import { MicrophoneStage } from "@phosphor-icons/react";
import Placeholder from "@/components/app/Placeholder";

export default function Page() {
  return (
    <Placeholder
      title="Mock Interview"
      icon={MicrophoneStage}
      blurb="Real-time voice mock interviews with live coding are being wired into the web app next. This is where you'll rehearse out loud and get a scored report."
    />
  );
}
