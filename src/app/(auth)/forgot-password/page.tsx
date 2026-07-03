"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Always show success (do not leak which emails exist).
    try {
      await api("/v1/auth/forgot-password", {
        method: "POST",
        auth: false,
        body: { email: email.trim() },
      });
    } catch {
      /* swallow */
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <Card className="p-7 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Check your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          If an account exists for {email}, a reset link is on its way.
        </p>
        <Link href="/login" className="mt-6 inline-block text-[13px] font-semibold text-violet-bright hover:underline">
          Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-7">
      <h1 className="font-display text-2xl font-bold text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-ink-soft">We&rsquo;ll email you a reset link.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-[13px] text-ink-soft">
        <Link href="/login" className="font-semibold text-violet-bright hover:underline">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
