import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
      <div className="max-w-sm">
        <Image src="/mark.png" alt="" width={44} height={44} className="mx-auto h-11 w-11 opacity-70" />
        <h1 className="mt-5 font-display text-2xl font-bold text-ink">You&rsquo;re offline</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Intavue needs a connection for live interviews and coaching. Reconnect and try again.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-full bg-[var(--cta)] px-6 py-3 text-sm font-semibold text-white"
        >
          Retry
        </Link>
      </div>
    </div>
  );
}
