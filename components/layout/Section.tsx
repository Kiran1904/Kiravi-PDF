import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

export function Section({
  id,
  title,
  description,
  action,
  className,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className={cn("py-12 sm:py-16", className)}>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id={`${id}-heading`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            {description && <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>}
          </div>
          {action}
        </div>
        <div className="mt-8">{children}</div>
      </Container>
    </section>
  );
}
