import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import LiveDemoSection from "@/components/landing/LiveDemoSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import RequirementsSection from "@/components/landing/RequirementsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { getReleaseAssets } from "@/lib/releases";

/* Server component: assets are fetched on the server (cached), so the page ships
 * fully rendered with no client-side GitHub waterfall and minimal hydration JS. */
export default async function LandingPage() {
  const assets = await getReleaseAssets();

  return (
    <div id="top" className="min-h-[100dvh] bg-bg text-ink">
      <Navbar assets={assets} />
      <HeroSection assets={assets} />
      <LiveDemoSection assets={assets} />
      <ProductShowcase />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <RequirementsSection />
      <CTASection assets={assets} />
      <Footer assets={assets} />
    </div>
  );
}
