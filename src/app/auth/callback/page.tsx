"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { session } from "@/lib/session";

function Callback() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    if (accessToken) {
      session.set(accessToken, refreshToken || undefined);
      router.replace("/dashboard");
    } else {
      router.replace("/login?error=google");
    }
  }, [params, router]);

  return (
    <div className="grid min-h-[100dvh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <Image src="/mark.png" alt="" width={40} height={40} className="h-10 w-10 animate-pulse" />
        <p className="text-sm text-ink-soft">Signing you in…</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={null}>
      <Callback />
    </Suspense>
  );
}
