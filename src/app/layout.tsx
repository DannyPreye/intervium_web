import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Display: a characterful grotesque for headlines.
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Body: clean, neutral, highly legible.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Mono: small labels and keyboard hints.
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const TITLE = "Intavue | Invisible AI Interview Copilot & Prep Suite";
const DESCRIPTION =
  "Ace your technical and behavioral interviews with Intavue. Our undetectable desktop AI copilot provides real-time answers, code, and structure during screen shares. Complete with mock interviews, resume analysis, and salary coaching.";

export const metadata: Metadata = {
  metadataBase: new URL("https://intavue.app"),
  title: {
    default: TITLE,
    template: "%s | Intavue",
  },
  description: DESCRIPTION,
  applicationName: "Intavue",
  authors: [{ name: "Intavue Team" }],
  creator: "Intavue",
  publisher: "Intavue",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  keywords: [
    "AI interview copilot",
    "interview assistant",
    "invisible interview helper",
    "mock interview practice",
    "resume analyzer",
    "coding interview prep",
    "system design practice",
    "behavioral interview AI",
    "salary negotiation",
    "pass technical interviews",
    "undetectable AI",
    "screen share hidden AI",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://intavue.app",
    siteName: "Intavue",
    images: [
      {
        url: "/intavue-app-icon.png",
        width: 1024,
        height: 1024,
        alt: "Intavue AI Copilot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/intavue-app-icon.png"],
    creator: "@intavue",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/intavue.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        {/* Fixed film-grain overlay for depth. Never on a scrolling container. */}
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
