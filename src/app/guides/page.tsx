import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides",
  description: "Short notes on BMI, loans, paraphrasing, privacy and Unix time.",
};

const guides = [
  {
    href: "/guides/how-to-calculate-bmi",
    title: "How to calculate BMI",
    description: "The formula, healthy ranges, and what BMI can and cannot tell you.",
  },
  {
    href: "/guides/how-loan-payments-work",
    title: "How loan payments work",
    description: "A plain-language look at principal, interest and monthly EMI.",
  },
  {
    href: "/guides/how-to-paraphrase-your-own-writing",
    title: "How to paraphrase your own writing",
    description: "Rewrite your own draft. Do not pass off someone else's words.",
  },
  {
    href: "/guides/keep-files-private-in-browser-tools",
    title: "Keep files private in browser tools",
    description: "Why local image and document tools avoid uploading your files.",
  },
  {
    href: "/guides/how-to-convert-kg-to-lbs",
    title: "How to convert kilograms to pounds",
    description: "The exact factor, a worked example, and when rounding is enough.",
  },
  {
    href: "/guides/what-is-a-unix-timestamp",
    title: "What is a Unix timestamp",
    description: "Epoch seconds, milliseconds, and how to read them.",
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-tight">Guides</h1>
      <p className="mt-3 text-muted">
        A few notes that sit next to the tools. How a formula works, or why a file stays on your computer.
      </p>
      <div className="mt-8 space-y-4">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="block rounded-2xl border border-line bg-white p-5 shadow-card hover:shadow-card-hover"
          >
            <h2 className="text-lg font-semibold text-ink">{guide.title}</h2>
            <p className="mt-1 text-sm text-muted">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
