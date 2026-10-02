import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { footerNav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-muted/40 mt-auto border-t">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="text-muted-foreground mt-3 max-w-xs text-sm">
              {site.name} — {site.tagline}
            </p>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm">
              Every tool here runs in your browser. Your files stay on your device.
            </p>
          </div>

          <FooterColumn title="Tools" links={footerNav.tools} />
          <FooterColumn title="Company" links={footerNav.company} />
        </div>

        <div className="text-muted-foreground mt-10 flex flex-col gap-2 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>{site.tagline}</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
