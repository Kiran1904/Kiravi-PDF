import Link from "next/link";

import { ProsePage } from "@/components/layout/ProsePage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Kiravi PDF is a set of free PDF and image tools that run entirely in your browser — no account, no uploads, no server-side storage.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <ProsePage
      title={`About ${site.name}`}
      lead="Free PDF and image tools that do the work on your device instead of ours."
    >
      <h2>Why this exists</h2>
      <p>
        Needing to merge two PDFs or shrink a photo is an ordinary, five-second task. Doing it online usually
        means handing your document to a stranger&rsquo;s server, watching a progress bar, and hoping the file
        is deleted afterwards. For a contract, a payslip or a passport scan, that is a poor trade.
      </p>
      <p>
        Modern browsers can do this work themselves. {site.name} is built on that: the file is read from your
        disk, processed in the tab, and written back as a download. Nothing is transmitted, which makes the
        tools both more private and faster — there is no upload to wait for.
      </p>

      <h2>How it works</h2>
      <p>
        The PDF tools use the same open-source rendering and document libraries that browsers and desktop
        readers rely on, loaded on demand when you open a tool. The image tools use the browser&rsquo;s own
        canvas and codec support. Heavy code is never loaded until the tool that needs it is opened, which is
        why the pages themselves stay light.
      </p>

      <h2>What we will not do</h2>
      <ul>
        <li>
          <strong>No fake tools.</strong> If a tool is listed, it works. Where a limitation is real — PDF
          compression depends heavily on what is inside the file, and we cannot yet read text out of a scan —
          we say so on the page rather than returning a disappointing file.
        </li>
        <li>
          <strong>No accounts to use the basics.</strong> No sign-up wall, no email capture, no watermark.
        </li>
        <li>
          <strong>No quiet uploads.</strong> The browser-processing claim appears only on tools where it is
          true.
        </li>
      </ul>

      <h2>What is coming</h2>
      <p>
        The obvious gaps are optical character recognition for scanned documents, a page-level PDF editor,
        watermarking and password handling, and batch processing for large jobs. Some of those genuinely need
        a server; where that happens, it will be clearly marked and kept separate from the browser-only tools.
      </p>

      <h2>Get in touch</h2>
      <p>
        Bug reports and tool requests are welcome — see the <Link href="/contact">contact page</Link>.
      </p>
    </ProsePage>
  );
}
