"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { List, X, SignOut, Sparkle, DotsThreeOutline } from "@phosphor-icons/react";
import { NAV, MOBILE_PRIMARY } from "@/lib/nav";
import { session } from "@/lib/session";
import { api, unwrap } from "@/lib/api";
import { cn } from "@/lib/utils";

type Me = { name?: string; email?: string; credits?: number };

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <Image src="/mark.png" alt="Intavue" width={30} height={30} className="h-[30px] w-[30px]" />
      <span className="font-display text-[18px] font-bold tracking-[-0.02em] text-ink">Intavue</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6">
      {NAV.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-1">
          {group.title && (
            <p className="px-3 pb-1 text-[10.5px] font-semibold tracking-[0.14em] text-ink-faint uppercase">
              {group.title}
            </p>
          )}
          {group.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-violet/12 text-ink"
                    : "text-ink-soft hover:bg-white/[0.04] hover:text-ink"
                )}
              >
                <Icon size={19} weight={active ? "fill" : "regular"} className={active ? "text-violet-bright" : ""} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function CreditPill({ credits }: { credits?: number }) {
  return (
    <Link
      href="/billing"
      className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-bg-raised px-3 py-1.5 text-[12.5px] font-semibold text-ink hover:border-violet/40"
    >
      <Sparkle size={14} weight="fill" className="text-violet-bright" />
      {credits ?? "—"} credits
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [drawer, setDrawer] = useState(false);

  // Auth guard.
  useEffect(() => {
    if (!session.isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setReady(true);
    api<unknown>("/v1/user/me")
      .then((r) => setMe(unwrap<Me>(r)))
      .catch(() => {});
  }, [router]);

  const logout = () => {
    session.clear();
    router.replace("/login");
  };

  if (!ready) {
    return (
      <div className="grid min-h-[100dvh] place-items-center">
        <Image src="/mark.png" alt="" width={40} height={40} className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line bg-bg-elevated/60 px-4 py-6 lg:flex">
        <div className="px-2">
          <Brand />
        </div>
        <div className="custom-scroll mt-8 flex-1 overflow-y-auto pr-1">
          <NavLinks />
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">{me?.name || "You"}</p>
            <p className="truncate text-[11px] text-ink-faint">{me?.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="shrink-0 rounded-lg p-2 text-ink-faint hover:bg-white/[0.05] hover:text-ink"
          >
            <SignOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur-xl lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <CreditPill credits={me?.credits} />
          <button
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-ink-soft hover:text-ink"
          >
            <List size={22} />
          </button>
        </div>
      </header>

      {/* Desktop top-right credit pill */}
      <div className="fixed right-6 top-5 z-30 hidden lg:block">
        <CreditPill credits={me?.credits} />
      </div>

      {/* Main content */}
      <main className="px-4 pb-24 pt-4 lg:ml-[264px] lg:px-10 lg:pb-14 lg:pt-8">
        <div className="mx-auto w-full max-w-[1360px]">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {MOBILE_PRIMARY.map((item) => {
          const Icon = item.icon;
          return (
            <MobileTab key={item.href} href={item.href} label={item.label} Icon={Icon} />
          );
        })}
        <button
          onClick={() => setDrawer(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-ink-faint"
        >
          <DotsThreeOutline size={22} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[300px] max-w-[85vw] flex-col bg-bg-elevated px-4 py-5">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setDrawer(false)} aria-label="Close menu" className="p-2 text-ink-faint">
                <X size={20} />
              </button>
            </div>
            <div className="custom-scroll mt-6 flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setDrawer(false)} />
            </div>
            <button
              onClick={logout}
              className="mt-4 flex items-center gap-2 rounded-xl border-t border-line px-3 py-3 text-[14px] font-medium text-ink-soft"
            >
              <SignOut size={18} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileTab({ href, label, Icon }: { href: string; label: string; Icon: React.ElementType }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2.5",
        active ? "text-violet-bright" : "text-ink-faint"
      )}
    >
      <Icon size={22} weight={active ? "fill" : "regular"} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
