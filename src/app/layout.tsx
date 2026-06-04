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

const TITLE = "Intavue: Your invisible AI interview copilot";
const DESCRIPTION =
  "Intavue is a desktop AI copilot that stays invisible during screen shares while it feeds you answers, structure, and code in real time. Plus a full prep suite: mock interviews, resume analysis, coding practice, company research, and salary coaching.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Intavue",
  keywords: [
    "AI interview copilot",
    "interview assistant",
    "invisible interview helper",
    "mock interview practice",
    "resume analyzer",
    "coding interview prep",
    "salary negotiation",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    siteName: "Intavue",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
