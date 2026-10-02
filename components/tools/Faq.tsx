import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ToolFaq } from "@/lib/tools/registry";

export function Faq({
  items,
  heading = "Frequently asked questions",
}: {
  items: readonly ToolFaq[];
  heading?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight">
        {heading}
      </h2>
      <Accordion className="mt-4">
        {items.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-left text-base font-medium">{item.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
