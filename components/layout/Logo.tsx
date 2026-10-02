import Link from "next/link";

import { LogoMark } from "@/components/layout/LogoMark";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Text-and-mark logo. The mark is inline SVG so it can be swapped out later. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 rounded-md font-semibold tracking-tight",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      aria-label={`${site.name} — home`}
    >
      <span className="bg-brand text-brand-foreground grid size-8 place-items-center rounded-lg shadow-sm">
        <LogoMark size={20} />
      </span>
      <span className="text-[1.0625rem] leading-none">
        Kiravi<span className="text-brand"> PDF</span>
      </span>
    </Link>
  );
}
