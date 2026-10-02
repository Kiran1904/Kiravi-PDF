import { ProsePage } from "@/components/layout/ProsePage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Kiravi PDF handles your files and data. Every tool processes files in your browser — we never receive, store or see your documents.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <ProsePage
      title="Privacy Policy"
      lead="The short version: we never receive your files, because they are never sent to us."
      updated="2 October 2026"
    >
      <h2>Your files</h2>
      <p>
        Every tool on {site.name} runs inside your browser. When you add a file, your browser reads it from
        your device into its own memory, processes it there, and hands the result back to you as a download.
        The file is not transmitted over the network at any point.
      </p>
      <p>
        This is an architectural fact rather than a promise about our conduct: there is no upload endpoint, so
        there is nothing for us to store, inspect, retain or hand over. Closing the tab discards everything.
      </p>
      <p>
        If a tool ever requires server-side processing — optical character recognition is the likely first
        case — it will say so clearly on its own page before you add a file, and the browser-only claim will
        not be shown for it.
      </p>

      <h2>What we do collect</h2>
      <p>
        We collect aggregate usage information to understand which tools people use and where they fail. If
        analytics is enabled, the events recorded are limited to:
      </p>
      <ul>
        <li>which tool page was viewed</li>
        <li>how many files were selected, and their combined size</li>
        <li>whether processing started, finished or failed, and how long it took</li>
        <li>an internal error code when something fails</li>
        <li>whether a download was clicked</li>
      </ul>
      <p>
        We do not collect file names, file contents, page contents, extracted text, or any identifier that
        points at you. Nothing in those events can be used to reconstruct anything about your document.
      </p>

      <h2>Cookies</h2>
      <p>
        {site.name} sets no advertising or tracking cookies. The tools do not require cookies to work and
        there is no account to stay signed in to.
      </p>

      <h2>Third parties</h2>
      <p>
        The site is served by a hosting provider, which — as with any website — processes the network requests
        needed to deliver the pages, including IP addresses in standard server logs. Because your files are
        never part of those requests, your documents are not exposed to the host.
      </p>

      <h2>Children</h2>
      <p>
        {site.name} is a general-purpose utility and is not directed at children. We do not knowingly collect
        personal information from anyone, of any age, because we do not collect personal information at all.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that affects how your files or data are handled, the date at the top
        of this page will change and the substance of the change will be described here rather than quietly
        folded in.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy can go to <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </ProsePage>
  );
}
