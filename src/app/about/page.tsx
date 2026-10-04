import type { Metadata } from "next";
import Link from "next/link";
import { Article } from "@/components/legal/Article";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "What Toolora is, what we will not build, and how to reach us.",
};

export default function AboutPage() {
  return (
    <Article title="About Toolora">
      <p>
        Toolora is a pile of small web tools: calculators, converters, image and file helpers, writing
        editors, and a few developer utilities. I built it so you can finish a task and leave. No app, no
        account.
      </p>
      <h2>What you can do here</h2>
      <p>
        Check BMI or a loan payment. Convert kilograms or file sizes. Resize a photo on your machine.
        Format JSON or decode a JWT. The full list is on the{" "}
        <Link href="/tools" className="font-semibold text-brand">
          tools page
        </Link>
        .
      </p>
      <h2>Where the work happens</h2>
      <p>
        Most pages do the math or the file work in your browser. We do not get a copy of the numbers,
        drafts, or files you drop in. If a tool ever needs a server, the page will say so first.
      </p>
      <h2>What we will not offer</h2>
      <p>
        No YouTube, Instagram, TikTok or Facebook downloaders. Those usually break platform rules and
        help people copy work they do not own. Writing tools are for text you wrote. They are not a way
        to hide a copied essay.
      </p>
      <h2>Ads</h2>
      <p>
        The tools are free. We may show Google ads later to cover hosting. You do not have to click an ad
        to see a result.{" "}
        <Link href="/guides" className="font-semibold text-brand">
          Guides
        </Link>{" "}
        explain formulas and privacy. They are not product pitches.
      </p>
      <h2>Contact</h2>
      <p>
        Corrections, tool requests and privacy questions:{" "}
        <a href={`mailto:${site.email}`} className="font-semibold text-brand">
          {site.email}
        </a>{" "}
        or the{" "}
        <Link href="/contact" className="font-semibold text-brand">
          contact page
        </Link>
        .
      </p>
    </Article>
  );
}
