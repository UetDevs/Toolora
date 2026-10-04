import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdSlot } from "@/components/ui/AdSlot";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { ToolCard } from "@/components/ui/ToolCard";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategory } from "@/lib/categories";
import { defaultFaqs, toolHowTo, toolTitle } from "@/lib/tool-copy";
import { getRelatedTools } from "@/lib/tools";
import { site } from "@/lib/site";
import type { Tool } from "@/lib/types";

export function ToolPageLayout({
  tool,
  illustration,
  children,
  example,
  extra,
}: {
  tool: Tool;
  illustration?: React.ReactNode;
  children: React.ReactNode;
  example?: React.ReactNode;
  extra?: React.ReactNode;
}) {
  const category = getCategory(tool.category);
  const related = getRelatedTools(tool);
  const faqs = defaultFaqs(tool);

  return (
    <div className="bg-gradient-to-b from-blue-50/80 to-canvas">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: tool.name,
          description: tool.longDescription ?? tool.description,
          url: `${site.url}${tool.href}`,
          isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-subtle" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={category?.href ?? "/tools"} className="hover:text-ink">
            {category?.name ?? "Tools"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink">{tool.name}</span>
        </nav>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            {tool.badge ? (
              <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {tool.badge}
              </p>
            ) : null}
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {tool.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
              {tool.longDescription ?? tool.description}
            </p>
            <div className="mt-5">
              <TrustBadges />
            </div>
          </div>
          {illustration}
        </div>

        <div className="mt-10">{children}</div>

        <div className="mt-6">
          <AdSlot />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-ink">How to use {toolTitle(tool)}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{toolHowTo(tool)}</p>
            {example}
          </section>
          <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-ink">Questions</h2>
            <div className="mt-2">
              <FaqAccordion items={faqs} />
            </div>
          </section>
        </div>

        {extra}

        {related.length ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-ink">Related tools</h2>
            <p className="mt-1 text-sm text-muted">Same category, nearby jobs.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <ToolCard key={item.slug} tool={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
