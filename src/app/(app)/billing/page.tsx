"use client";

import { CreditCard } from "@phosphor-icons/react";
import Placeholder from "@/components/app/Placeholder";

export default function Page() {
  return (
    <Placeholder
      title="Billing"
      icon={CreditCard}
      blurb="Credits, plans, and referrals are coming to the web app."
    />
  );
}
