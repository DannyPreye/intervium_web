"use client";
/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities */

import React, { useEffect, useState } from "react";
import { ReleaseAssets } from "@/lib/types";
import { fetchReleaseAssets, useDownloadHref } from "@/lib/hooks";

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import CompatibilitySection from "@/components/landing/CompatibilitySection";
import StealthSection from "@/components/landing/StealthSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import RequirementsSection from "@/components/landing/RequirementsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  const [assets, setAssets] = useState<ReleaseAssets>({
    windows: null,
    mac: null,
    linux: null,
    version: null,
  });

  const downloadHref = useDownloadHref(assets);

  useEffect(() => {
    fetchReleaseAssets().then(setAssets);
  }, []);

  return (
    <div id="top" className="min-h-[100dvh] bg-bg text-ink">
      <Navbar assets={assets} />
      <HeroSection assets={assets} />
      <CompatibilitySection />
      <StealthSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection downloadHref={downloadHref} />
      <FAQSection />
      <RequirementsSection />
      <CTASection assets={assets} />
      <Footer assets={assets} />
    </div>
  );
}
