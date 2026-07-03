"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api, storeTokens, ApiError } from "@/lib/api";
import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";

type AuthResponse = { user?: unknown; tokens?: { access?: { token: string }; refresh?: { token: string } } };

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<AuthResponse>("/v1/auth/register", {
        method: "POST",
        auth: false,
        body: { name: name.trim(), email: email.trim(), password },
      });
      if (res.tokens?.access?.token) {
        storeTokens(res.tokens);
        router.replace("/dashboard");
      } else {
        // Email-verification-required mode: no tokens returned.
        setCheckEmail(true);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <Card className="p-7 text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Check your inbox</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          We sent a verification link to <span className="text-ink">{email}</span>. Verify your email,
          then sign in.
        </p>
        <Link href="/login" className="mt-6 inline-block text-[13px] font-semibold text-violet-bright hover:underline">
          Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-7">
      <h1 className="font-display text-2xl font-bold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink-soft">50 free credits to start. No card needed.</p>

      <div className="mt-6 space-y-4">
        <GoogleButton label="Sign up with Google" />
        <OrDivider />
      </div>

      <form onSubmit={submit} className="mt-4 space-y-4">
        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-300">
            <Warning size={15} weight="fill" className="shrink-0" /> {error}
          </p>
        )}
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-violet-bright hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
