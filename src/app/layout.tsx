import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intavue — AI Interview Coach",
  description:
    "Ace every interview with your personal AI coach. Live feedback, resume analysis, salary negotiation, and coding challenges — all in one desktop app.",
  openGraph: {
    title: "Intavue — AI Interview Coach",
    description:
      "Ace every interview with your personal AI coach. Live feedback, resume analysis, salary negotiation, and coding challenges — all in one desktop app.",
    type: "website",
  },
  icons: {
    icon: "/intavue_logo.png",
    shortcut: "/intavue_logo.png",
    apple: "/intavue_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
