"use client";
import React, { useEffect, useState } from "react";
import { ReleaseAssets } from "@/lib/types";
import { fetchReleaseAssets } from "@/lib/hooks";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PrivacyPage() {
  const [assets, setAssets] = useState<ReleaseAssets>({
    windows: null,
    mac: null,
    linux: null,
    version: null,
  });

  useEffect(() => {
    fetchReleaseAssets().then(setAssets);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-bg text-ink-soft">
      <Navbar assets={assets} />
      
      <main className="container-x mx-auto max-w-4xl py-32 md:py-40">
        <div className="rounded-2xl border border-line bg-bg-elevated/40 p-8 shadow-sm md:p-12 text-[15px] leading-relaxed">
          <h1 className="mb-8 font-display text-3xl font-extrabold text-ink md:text-4xl">INTAVUE - TERMS OF SERVICE AND PRIVACY POLICY</h1>
          
          <p className="mb-4">Last Updated: June 2026</p>
          <p className="mb-8 font-semibold">BY INSTALLING OR USING INTAVUE, YOU AGREE TO THESE TERMS. IF YOU DO NOT AGREE, DO NOT INSTALL OR USE THE SOFTWARE.</p>
          
          <h2 className="mt-12 mb-6 font-display text-2xl font-bold text-ink">SECTION 1: TERMS OF SERVICE</h2>
          
          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.1 Acceptance of Terms</h3>
          <p className="mb-4">By downloading, installing, or using Intavue ("the Software"), you agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legal agreement between you ("User") and Intavue ("we", "us", "our").</p>
          
          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.2 Description of Service</h3>
          <p className="mb-4">Intavue is an AI-powered interview assistant for Windows and macOS. It includes:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>Preparation tools: mock interviews with scored feedback, a daily practice question, a personal "Story Bank" for your experiences, resume analysis and building, and cover letter and outreach drafting.</li>
            <li>A live Interview Companion: an on-screen assistant that provides real-time suggestions during interviews. On supported devices it uses operating-system screen-capture protection to remain hidden from screen recording and screen-sharing software while staying visible to you.</li>
          </ul>
          
          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.3 License Grant</h3>
          <p className="mb-4">We grant you a limited, non-exclusive, non-transferable, revocable license to use the Software for personal, non-commercial purposes, subject to these Terms.</p>
          
          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.4 Acceptable Use and Your Responsibility</h3>
          <p className="mb-4">You are solely responsible for how you use the Software, including the live Interview Companion and its screen-capture protection. You agree to:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>Comply with all applicable laws and with the rules, policies, terms, and instructions of any interview, examination, assessment, employer, educational institution, certification body, or platform in which you participate.</li>
            <li>Not use the Software to cheat, deceive, defraud, impersonate another person, gain an unfair advantage, or circumvent monitoring, proctoring, or integrity controls where doing so is prohibited by the relevant party or by law.</li>
            <li>Obtain any consent required by law before recording, capturing, or processing another person's audio, video, likeness, or other personal information.</li>
          </ul>
          <p className="mb-4">Screen-capture protection is a privacy feature. Whether you are permitted to use it, or any other feature, in a given setting is your responsibility to determine. We are not responsible for any consequences arising from your use of the Software in violation of any rule, agreement, policy, or law, including disqualification, academic or professional penalties, loss of opportunity, or legal liability.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.5 General User Responsibilities</h3>
          <p className="mb-4">You also agree to:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>Provide accurate information when using the Software.</li>
            <li>Use the Software only for lawful purposes.</li>
            <li>Not attempt to reverse engineer, decompile, or disassemble the Software.</li>
            <li>Not redistribute, sublicense, or resell the Software.</li>
          </ul>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.6 Billing, Credits, and Subscriptions</h3>
          <p className="mb-4">Certain features consume credits and may require a paid subscription. Credit costs, prices, and plan terms are shown within the Software and may change. Payments are handled by third-party processors (such as Stripe and Paystack); we do not store your full payment card details. Paid subscriptions renew automatically until cancelled, and you may cancel at any time to stop future renewals. Except where required by applicable law, fees and credit purchases are non-refundable. Free credits and promotional credits have no cash value.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.7 Intellectual Property</h3>
          <p className="mb-4">All rights, title, and interest in and to the Software, including all intellectual property rights, are and will remain the exclusive property of Intavue and its licensors. Content you provide remains yours; you grant us a limited license to process it solely to provide the Software's features to you.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.8 Disclaimer of Warranties</h3>
          <p className="mb-4 uppercase tracking-wide">THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. WE DO NOT WARRANT THAT THE SOFTWARE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. WE DO NOT WARRANT THAT SCREEN-CAPTURE PROTECTION WILL HIDE THE SOFTWARE FROM ALL CAPTURE METHODS OR FROM ALL MONITORING, RECORDING, OR PROCTORING SOFTWARE, OR FROM CAPTURE BY EXTERNAL CAMERAS OR DEVICES. AI-GENERATED OUTPUT MAY BE INACCURATE OR INCOMPLETE AND SHOULD BE REVIEWED BEFORE USE.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.9 Limitation of Liability</h3>
          <p className="mb-4 uppercase tracking-wide">IN NO EVENT SHALL INTAVUE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE SOFTWARE, REGARDLESS OF THE CAUSE OF ACTION OR THE THEORY OF LIABILITY.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.10 Termination</h3>
          <p className="mb-4">We may terminate or suspend your access to the Software at any time, without prior notice, for any reason, including breach of these Terms.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">1.11 Modifications</h3>
          <p className="mb-4">We reserve the right to modify these Terms at any time. Continued use of the Software after changes constitutes acceptance of the revised Terms.</p>

          <h2 className="mt-16 mb-6 font-display text-2xl font-bold text-ink border-t border-line pt-12">SECTION 2: PRIVACY POLICY</h2>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">2.1 Information We Collect</h3>
          <p className="mb-4">We may collect the following types of information:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>Account information (such as email address and name) when you create an account.</li>
            <li>Profile content you provide, including your resume, career targets, and Story Bank entries.</li>
            <li>Content you submit during practice and live sessions, which may include audio you choose to record and screenshots you choose to capture.</li>
            <li>Usage data (features used, session duration, interaction patterns).</li>
            <li>Device information (operating system, app version).</li>
          </ul>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">2.2 How We Use Your Information</h3>
          <p className="mb-4">We use collected information to:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>Provide the Software's features, including generating real-time and practice responses.</li>
            <li>Personalize your experience using your profile, resume, and Story Bank.</li>
            <li>Analyze usage to improve performance and reliability.</li>
            <li>Process payments and manage subscriptions and credits.</li>
            <li>Communicate important updates, and ensure security and prevent abuse.</li>
          </ul>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">2.3 AI Processing and Third Parties</h3>
          <p className="mb-4">To generate responses, content you submit, including transcribed audio and screenshots captured during live sessions and your profile and resume context, is sent to our servers and to third-party AI providers (such as OpenAI and ElevenLabs) that process it on our behalf. Data transmitted to our servers and these providers is encrypted in transit.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">2.4 Data Sharing</h3>
          <p className="mb-4">We do not sell your personal information. We may share data with:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>Service providers who help operate the Software (for example, AI model providers, payment processors, and hosting providers).</li>
            <li>Law enforcement or authorities when required by law.</li>
            <li>Third parties with your explicit consent.</li>
          </ul>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">2.5 Data Retention</h3>
          <p className="mb-4">We retain your data only as long as necessary to provide the Software's services. You may request deletion of your account and associated data at any time.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">2.6 Your Rights</h3>
          <p className="mb-4">Subject to applicable law, you have the right to:</p>
          <ul className="mb-4 ml-6 list-disc space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Opt out of non-essential data collection.</li>
            <li>Export your data in a portable format.</li>
          </ul>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">2.7 Local Storage</h3>
          <p className="mb-4">The Software may use local storage on your device to save preferences, credentials, and session data. This data remains on your device unless transmission is necessary for service functionality.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">2.8 Children's Privacy</h3>
          <p className="mb-4">The Software is not intended for use by individuals under the age of 13 (or the minimum age required in your jurisdiction). We do not knowingly collect personal information from children under that age.</p>

          <h3 className="mt-8 mb-3 font-display text-xl font-semibold text-ink">2.9 Changes to Privacy Policy</h3>
          <p className="mb-4">We may update this Privacy Policy from time to time. We will notify you of significant changes through the Software or via email.</p>

          <h2 className="mt-16 mb-6 font-display text-2xl font-bold text-ink border-t border-line pt-12">SECTION 3: CONTACT</h2>
          <p className="mb-4">If you have questions about these Terms or our Privacy Policy, contact us at support@intavue.app or through our official support channels.</p>
          
          <p className="mb-4 mt-8 font-medium">By clicking "I Agree" or installing the Software, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and Privacy Policy.</p>
        </div>
      </main>

      <Footer assets={assets} />
    </div>
  );
}
