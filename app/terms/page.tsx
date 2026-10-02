import { ProsePage } from "@/components/layout/ProsePage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that apply when you use the free PDF and image tools on Kiravi PDF.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <ProsePage
      title="Terms of Service"
      lead={`The terms below apply whenever you use ${site.name}.`}
      updated="2 October 2026"
    >
      <h2>Using the service</h2>
      <p>
        {site.name} provides free, browser-based tools for working with PDF and image files. No account is
        required. You may use the tools for personal or commercial work.
      </p>
      <p>
        You are responsible for the files you process and for having the right to process them. Do not use the
        tools in furtherance of anything unlawful, or to interfere with the site or with other people&rsquo;s
        use of it.
      </p>

      <h2>No warranty</h2>
      <p>
        The tools are provided as they are, without warranty of any kind. File processing in a browser depends
        on your device, your browser version and the structure of the file itself, and some documents will not
        process successfully. We do not guarantee that a given file will work, that output will be free of
        defects, or that a particular compression ratio or quality level will be achieved.
      </p>
      <p>
        <strong>Keep your originals.</strong> Treat the output of any tool as a new file to be checked, not as
        a replacement for the file you started with.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, {site.name} is not liable for any loss of data, loss of profit, or
        indirect or consequential damage arising from use of the site. Because your files are processed on
        your own device and never sent to us, we have no access to them and no ability to recover them.
      </p>

      <h2>Availability and changes</h2>
      <p>
        We may add, change or withdraw tools, and we may change these terms. Material changes will be
        reflected in the date at the top of this page. Continuing to use the site after a change means you
        accept the revised terms.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The {site.name} name, design and code belong to us. The files you process remain entirely yours — we
        acquire no rights in them, and could not, since we never receive them.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can go to <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </ProsePage>
  );
}
