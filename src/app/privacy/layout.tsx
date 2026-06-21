import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service & Privacy Policy",
  description:
    "Intavue's Terms of Service and Privacy Policy — how the app works, what data we collect, how it is used, and your responsibilities when using the interview copilot.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
