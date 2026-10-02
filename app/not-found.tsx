import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { buttonVariants } from "@/components/ui/button";
import { getFeaturedTools } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export const metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="text-center">
        <p className="text-brand text-sm font-semibold">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          We couldn&rsquo;t find that page
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md">
          The link may be out of date. Here are the tools people use most.
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 px-6 text-base")}>
          Back to home
        </Link>
      </div>
      <div className="mt-14">
        <ToolGrid tools={getFeaturedTools()} />
      </div>
    </Container>
  );
}
