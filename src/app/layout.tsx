import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { FAQ } from "@/lib/faq";
import PWA from "@/components/pwa/PWA";
import "./globals.css";

const SITE_URL = "https://intavue.app";

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

const TITLE = "Intavue | AI Interview Prep, Mock Interviews & Coaching";
const DESCRIPTION =
  "Intavue is an AI interview preparation platform for Windows and macOS. Rehearse with real-time voice mock interviews and live coding rounds, get scored feedback, and master weak concepts with an AI voice coach — plus a resume analyzer and builder, a cover letter writer, and a personal story bank.";

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
    "AI interview prep",
    "AI mock interviews",
    "voice mock interview",
    "interview coaching",
    "AI interview coach",
    "live coding interview practice",
    "resume analyzer",
    "resume builder",
    "ATS resume checker",
    "cover letter generator",
    "behavioral interview practice",
    "technical interview prep",
    "interview preparation app",
  ],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Intavue",
  },
  category: "technology",
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
        alt: "Intavue — AI Interview Prep",
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
    apple: "/intavue-app-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#08070e",
  colorScheme: "dark",
  viewportFit: "cover",
};

// Structured data (JSON-LD) — helps Google understand the product and surface
// rich results (app listing + FAQ accordion). The FAQ entries are the same
// constant the page renders, so the markup always matches visible content.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Intavue",
      url: SITE_URL,
      logo: `${SITE_URL}/intavue-app-icon.png`,
      sameAs: ["https://twitter.com/intavue"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Intavue",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Intavue",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Interview preparation",
      operatingSystem: "Windows 10+, macOS 12+",
      description: DESCRIPTION,
      url: SITE_URL,
      image: `${SITE_URL}/intavue-app-icon.png`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      featureList: [
        "Real-time voice mock interviews with an AI interviewer",
        "Live coding rounds (JavaScript, Python, Java, C++) with test cases",
        "Concept Coach — AI voice tutor with diagrams, live code, and quizzes",
        "Scored performance reports with model answers",
        "Resume analyzer and builder with ATS scoring",
        "Cover letter and outreach writer",
        "Personal story bank for behavioral answers",
        "Application tracker and interview debriefs",
      ],
      offers: [
        { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
        { "@type": "Offer", name: "Pro", price: "15", priceCurrency: "USD" },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Fixed film-grain overlay for depth. Never on a scrolling container. */}
        <div className="grain" aria-hidden="true" />
        {children}
        <PWA />
      </body>
    </html>
  );
}
