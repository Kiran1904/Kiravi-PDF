import Link from "next/link";

import { HeaderActions } from "@/components/layout/HeaderActions";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/layout/Container";
import { mainNav } from "@/lib/site";
import { getToolIndex } from "@/lib/tools/registry";

export function Header() {
  const index = getToolIndex();

  return (
    <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center gap-4">
        <Logo />

        <nav aria-label="Main" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto md:ml-0">
          <HeaderActions index={index} />
        </div>
      </Container>
    </header>
  );
}
