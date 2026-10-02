import Link from "next/link";

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
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden focusable="false">
          <path
            d="M6 3.5h7.2L19 9.3V20a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M13 3.5V9a.5.5 0 0 0 .5.5H19"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M9 13.5h6M9 16.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-[1.0625rem] leading-none">
        Kiravi<span className="text-brand"> PDF</span>
      </span>
    </Link>
  );
}
