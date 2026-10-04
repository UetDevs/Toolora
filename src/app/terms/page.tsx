import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Rules for using Toolora’s free tools, including acceptable use and limits of liability.",
};

export default function TermsPage() {
  return (
    <Article title="Terms & Conditions" updated="3 October 2026">
      <p>
        By using {site.url} you agree to these terms. If you do not agree, please leave the site.
      </p>
      <h2>The service</h2>
      <p>
        Toolora provides free web pages that help with calculations, conversions, formatting and similar
        tasks. We may add, change or remove a tool at any time. There is no paid plan and no guarantee of
        uninterrupted access.
      </p>
      <h2>Acceptable use</h2>
      <p>You may use the tools for personal, educational or ordinary business work. You may not:</p>
      <ul>
        <li>overload or attack the site, or scrape it in a way that harms other visitors</li>
        <li>use a tool to break the law or to infringe someone else’s copyright or privacy</li>
        <li>copy the Toolora name or layout to impersonate this site</li>
        <li>treat writing tools as a way to submit another person’s work as your own</li>
      </ul>
      <h2>Results are estimates</h2>
      <p>
        Health, money, grades and conversions are educational estimates. They are not medical, financial,
        legal or academic advice. Confirm important decisions with a qualified professional. See the{" "}
        <Link href="/disclaimer" className="font-semibold text-brand">
          Disclaimer
        </Link>
        .
      </p>
      <h2>Your content</h2>
      <p>
        Text and files you process in the browser remain yours. If you email us, you give us permission to
        read that message so we can reply. Do not send secrets or other people’s private data.
      </p>
      <h2>Advertising</h2>
      <p>
        Pages may include third-party ads. Advertisers are responsible for their own offers. Clicking an ad
        takes you away from Toolora.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        The site is provided “as is”. To the fullest extent allowed by law we are not liable for loss that
        follows from using or being unable to use a tool, including wrong calculations or lost files.
      </p>
      <h2>Contact</h2>
      <p>
        Legal notices:{" "}
        <a href={`mailto:${site.email}`} className="font-semibold text-brand">
          {site.email}
        </a>
        .
      </p>
    </Article>
  );
}
