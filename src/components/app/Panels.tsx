import { cn } from "@/lib/utils";

/**
 * Intentional two-column app layout: a config / nav rail on the left (sticky on
 * desktop) and a content area that fills the remaining width. Stacks on mobile.
 * Fixes the "everything squeezed down the middle" look of centered max-w columns.
 */
export function TwoPane({
  aside,
  children,
  wide = false,
  className,
}: {
  aside: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 lg:items-start",
        wide ? "lg:grid-cols-[420px_minmax(0,1fr)]" : "lg:grid-cols-[340px_minmax(0,1fr)]",
        className
      )}
    >
      <aside className="lg:sticky lg:top-8 lg:self-start">{aside}</aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
