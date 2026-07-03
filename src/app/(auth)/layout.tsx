import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-[100dvh] place-items-center px-5 py-10">
      <div className="aura pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative w-full max-w-[400px]">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <Image src="/mark.png" alt="Intavue" width={34} height={34} className="h-[34px] w-[34px]" />
          <span className="font-display text-[22px] font-bold tracking-[-0.02em] text-ink">Intavue</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
