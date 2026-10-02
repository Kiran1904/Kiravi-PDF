import Link from "next/link";
import { ArrowRight, Gauge, Infinity as InfinityIcon, ShieldCheck, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Faq } from "@/components/tools/Faq";
import { ToolGrid } from "@/components/tools/ToolGrid";
import { ToolSearch } from "@/components/tools/ToolSearch";
import { buttonVariants } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { getFeaturedTools, getToolIndex, getToolsByCategory } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: "/",
});

const SUGGESTIONS = ["merge-pdf", "compress-pdf", "jpg-to-pdf", "pdf-to-jpg", "resize-image"];

const WHY = [
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Every tool here runs in your browser. Your documents are never uploaded, so there is nothing on our servers to leak, log or delete.",
  },
  {
    icon: Gauge,
    title: "Fast, because it is local",
    body: "No upload, no queue, no download. Processing starts the moment you pick a file and is limited only by your own device.",
  },
  {
    icon: InfinityIcon,
    title: "Free and no account",
    body: "No sign-up, no email, no watermarks on your output. Open a tool and use it.",
  },
  {
    icon: Sparkles,
    title: "Built for real work",
    body: "Page-level control, honest size reporting and clear error messages — rather than a spinner that fails silently.",
  },
];

const HOW = [
  { step: "Choose a tool", body: "Pick one from the list or search for what you want to do." },
  {
    step: "Add your file",
    body: "Drag it in or browse for it. It is read by your browser, not sent anywhere.",
  },
  { step: "Set your options", body: "Page ranges, quality, size, order — whatever that tool offers." },
  { step: "Download the result", body: "Save the finished file straight to your device." },
];

const HOME_FAQS = [
  {
    q: "Are my files uploaded to a server?",
    a: "No. Every tool on Kiravi PDF processes files inside your browser using the browser's own PDF and image capabilities. Your file never travels over the network, which is also why the tools keep working if your connection drops mid-task.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. There are no accounts, no email requirement and no usage counter. Open a tool and use it.",
  },
  {
    q: "Is there a file size limit?",
    a: "There is a practical one rather than a policy one. Because processing happens on your device, the ceiling is your browser's memory — we cap PDFs at 100 MB and images at 50 MB per file, which is comfortably inside what a typical laptop or phone handles.",
  },
  {
    q: "Will the tools work on my phone?",
    a: "Yes. Every tool is built mobile-first and the whole upload, configure and download flow works on a phone screen. Very large files are the exception: a phone has less memory to work with than a laptop.",
  },
  {
    q: "Do you support scanned documents and OCR?",
    a: "You can merge, split, rotate and compress scans like any other PDF. What you cannot yet do is turn the pictures of text into real text — that needs optical character recognition, which is not part of the current toolset. We say so plainly on the PDF to Text page rather than returning an empty file.",
  },
  {
    q: "Is Kiravi PDF really free?",
    a: "The tools here are free to use, with no watermarks and no feature gates. Paid options may appear later for things that genuinely cost money to run, such as server-side OCR, but the browser-based tools are the product and they stay free.",
  },
];

export default function HomePage() {
  const index = getToolIndex();
  const featured = getFeaturedTools();
  const pdfTools = getToolsByCategory("pdf");
  const imageTools = getToolsByCategory("image");

  return (
    <>
      <section className="border-b">
        <Container className="py-14 text-center sm:py-20">
          <p className="text-brand bg-brand-muted mx-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <ShieldCheck aria-hidden className="size-3.5" />
            Files processed in your browser — never uploaded
          </p>

          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Free PDF &amp; Image Tools
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Merge, split, compress, convert and edit your files online. Fast, simple and easy to use.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <ToolSearch index={index} suggestions={SUGGESTIONS} />
          </div>
        </Container>
      </section>

      <Section
        id="popular"
        title="Popular tools"
        description="The tools people reach for most."
        action={
          <Link
            href="#pdf-tools"
            className="text-brand inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            See all tools
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        }
      >
        <ToolGrid tools={featured} />
      </Section>

      <Section
        id="pdf-tools"
        title="PDF tools"
        description="Reorganise, convert and shrink PDF documents without installing anything."
        className="bg-muted/30 border-y"
      >
        <ToolGrid tools={pdfTools} />
      </Section>

      <Section
        id="image-tools"
        title="Image tools"
        description="Compress, resize, crop, convert and clean up photos and graphics."
      >
        <ToolGrid tools={imageTools} />
      </Section>

      <Section id="why" title={`Why ${site.name}?`} className="bg-muted/30 border-y">
        <ul className="grid gap-6 sm:grid-cols-2">
          {WHY.map((item) => (
            <li key={item.title} className="bg-card flex gap-4 rounded-2xl border p-5">
              <span className="bg-brand-muted text-brand grid size-10 shrink-0 place-items-center rounded-xl">
                <item.icon aria-hidden className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="how" title="How it works" description="Four steps, no account, no waiting in a queue.">
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW.map((item, index) => (
            <li key={item.step}>
              <span className="bg-brand text-brand-foreground grid size-9 place-items-center rounded-full text-sm font-semibold">
                {index + 1}
              </span>
              <h3 className="mt-3 font-semibold">{item.step}</h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section aria-labelledby="privacy-heading" className="bg-muted/30 border-y py-12 sm:py-16">
        <Container className="max-w-3xl text-center">
          <span className="bg-success/10 text-success mx-auto grid size-12 place-items-center rounded-2xl">
            <ShieldCheck aria-hidden className="size-6" />
          </span>
          <h2 id="privacy-heading" className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Your files never leave your device
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Conventional online file tools work by uploading your document, processing it on a server and
            sending it back. That means your file sits on someone else&rsquo;s machine, however briefly.{" "}
            {site.name} does the work in the browser tab instead: the file is read from your disk, processed
            in memory and written back as a download. Nothing is transmitted, so there is nothing to retain.
          </p>
          <Link
            href="/privacy"
            className="text-brand mt-5 inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            Read our privacy approach
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Container>
      </section>

      <Container className="max-w-3xl py-12 sm:py-16">
        <Faq items={HOME_FAQS} heading="Common questions" />
      </Container>

      <section className="border-t py-14 sm:py-20">
        <Container className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pick a tool and get started</h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-xl">
            Nineteen tools, no sign-up, nothing to install. {site.tagline}.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/pdf/merge-pdf" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}>
              Merge PDF
            </Link>
            <Link
              href="/pdf/compress-pdf"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6 text-base")}
            >
              Compress PDF
            </Link>
            <Link
              href="/image/compress-image"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6 text-base")}
            >
              Compress Image
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
