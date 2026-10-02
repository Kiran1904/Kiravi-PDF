"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search } from "lucide-react";

import { ToolSearch } from "@/components/tools/ToolSearch";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CATEGORY_LABELS, type ToolIndexEntry } from "@/lib/tools/registry";
import { mainNav } from "@/lib/site";

export function HeaderActions({ index }: { index: ToolIndexEntry[] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-lg" aria-label="Search tools">
              <Search className="size-5" />
            </Button>
          }
        />
        <SheetContent side="top" className="px-4 pt-14 pb-8 sm:px-6">
          <SheetTitle className="sr-only">Search tools</SheetTitle>
          <div className="mx-auto w-full max-w-2xl">
            <ToolSearch index={index} autoFocus placeholder="Search for a tool…" />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon-lg" aria-label="Open menu" className="md:hidden">
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent side="right" className="overflow-y-auto p-6">
          <SheetTitle className="text-base">Menu</SheetTitle>
          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="hover:bg-accent focus-visible:ring-ring block rounded-lg px-3 py-2.5 text-base font-medium focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {(["pdf", "image"] as const).map((category) => (
            <div key={category}>
              <p className="text-muted-foreground px-3 pb-1 text-xs font-semibold tracking-wide uppercase">
                {CATEGORY_LABELS[category]}
              </p>
              <ul>
                {index
                  .filter((tool) => tool.category === category)
                  .map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/${tool.category}/${tool.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring block rounded-lg px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </SheetContent>
      </Sheet>
    </div>
  );
}
