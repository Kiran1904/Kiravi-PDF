import { Mail } from "lucide-react";

import { ProsePage } from "@/components/layout/ProsePage";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Contact",
  description: "Report a bug, request a tool, or ask a question about Kiravi PDF.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <ProsePage title="Contact" lead="Bug reports, tool requests and questions are all welcome.">
      <p>
        {site.name} has no accounts and no support portal — email is the whole system. Write to the address
        below and a person reads it.
      </p>

      <p>
        <a
          href={`mailto:${site.email}`}
          className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base no-underline")}
        >
          <Mail className="size-4" />
          {site.email}
        </a>
      </p>

      <h2>Reporting a problem with a file</h2>
      <p>
        Because your files are processed in your browser and never reach us, we cannot look at the file that
        failed — and please do not send it. What helps instead:
      </p>
      <ul>
        <li>which tool you were using, and what you selected</li>
        <li>your browser and operating system, with versions</li>
        <li>the approximate file size, and the page count for a PDF</li>
        <li>the exact message you saw</li>
        <li>whether the file came from a scanner, a phone camera, or an export from another program</li>
      </ul>

      <h2>Requesting a tool</h2>
      <p>
        Tell us what you are trying to accomplish rather than only naming the feature — it often turns out an
        existing tool covers it, or that a slightly different tool would serve better.
      </p>

      <h2>Privacy and legal</h2>
      <p>
        Privacy questions go to the same address. Our approach is described on the{" "}
        <a href="/privacy">privacy page</a>, and the <a href="/terms">terms of service</a> cover use of the
        site.
      </p>
    </ProsePage>
  );
}
