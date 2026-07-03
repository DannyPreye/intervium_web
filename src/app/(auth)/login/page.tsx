"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api, storeTokens, ApiError } from "@/lib/api";
import { session } from "@/lib/session";

type AuthResponse = { user?: unknown; tokens?: { access?: { token: string }; refresh?: { token: string } } };

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<AuthResponse>("/v1/auth/login", {
        method: "POST",
        auth: false,
        body: { email: email.trim(), password },
      });
      if (!res.tokens?.access?.token) throw new Error("Login did not return a session.");
      storeTokens(res.tokens);
      router.replace(session.isAuthenticated() ? next : "/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign you in. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-7">
      <h1 className="font-display text-2xl font-bold text-ink">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-soft">Sign in to continue your prep.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-[13px] text-rose-300">
            <Warning size={15} weight="fill" className="shrink-0" /> {error}
          </p>
        )}
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
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>
            <Link href="/forgot-password" className="text-[12px] text-violet-bright hover:underline">
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-soft">
        New here?{" "}
        <Link href="/register" className="font-semibold text-violet-bright hover:underline">
          Create an account
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
