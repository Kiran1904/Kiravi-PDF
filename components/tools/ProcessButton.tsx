"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The primary action of every tool — large enough to hit with a thumb. */
export function ProcessButton({
  children,
  busy = false,
  disabled = false,
  onClick,
  className,
  icon,
}: {
  children: React.ReactNode;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy}
      className={cn("h-12 w-full px-6 text-base sm:w-auto", className)}
    >
      {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : icon}
      {children}
    </Button>
  );
}
