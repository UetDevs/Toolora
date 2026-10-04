import Link from "next/link";
import { ArrowRight, CheckCircle2, Laptop, Search, Sparkles } from "lucide-react";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { TrustBadges } from "@/components/ui/TrustBadges";
import { categories } from "@/lib/categories";
import { getPopularTools } from "@/lib/tools";

const guides = [
  { href: "/guides/how-to-calculate-bmi", title: "How to calculate BMI" },
  { href: "/guides/how-loan-payments-work", title: "How loan payments work" },
  { href: "/guides/keep-files-private-in-browser-tools", title: "Keep files private in browser tools" },
];

export default function HomePage() {
  const popular = getPopularTools();

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-slate-50 to-white">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand shadow-card">
            <Sparkles className="h-3.5 w-3.5" />
            Free to use. No account.
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl sm:leading-tight">
            Calculators and converters
            <br />
            that run on your computer
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Need a BMI number, a resized photo, or JSON cleaned up? Open the page, get the result, close
            the tab. Most of this never hits our servers.
          </p>
          <form action="/tools" className="mx-auto mt-8 flex max-w-xl gap-2 rounded-full border border-line bg-white p-1.5 shadow-card">
            <Search className="ml-3 h-5 w-5 self-center text-subtle" />
            <input
              name="q"
              placeholder="Try BMI, image resizer, JSON…"
              className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
            />
            <button
              type="submit"
              className="h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Search
            </button>
          </form>
          <div className="mt-6 flex justify-center">
            <TrustBadges />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">Browse by category</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Pick a group and open a page. Each one does one job.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Popular tools</h2>
            <p className="mt-2 text-muted">The ones people usually start with.</p>
          </div>
          <Link href="/tools" className="hidden text-sm font-semibold text-brand sm:inline-flex sm:items-center sm:gap-1">
            View All Tools
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {popular.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.href}
              className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <IconBadge name={tool.icon} tint={tool.iconTint} />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-ink">{tool.name}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{tool.description}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-brand transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { title: "1. Open a tool", text: "Search or pick a category. One page, one job." },
            { title: "2. Type or drop a file", text: "Numbers, text, a photo, a clip. It usually stays in this tab." },
            { title: "3. Copy or download", text: "Take the result and leave. No account to create first." },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <h3 className="font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-bold text-ink">Guides</h2>
        <p className="mt-2 text-muted">How a formula works, or why a file never gets uploaded.</p>
        <div className="mt-6 flex flex-col gap-3">
          {guides.map((guide) => (
            <Link key={guide.href} href={guide.href} className="rounded-2xl border border-line bg-white px-5 py-4 font-semibold text-ink shadow-card hover:text-brand">
              {guide.title}
            </Link>
          ))}
        </div>
        <Link href="/guides" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
          All guides <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid items-center gap-8 rounded-3xl border border-line bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-10 sm:px-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex items-start gap-5">
            <span className="hidden h-24 w-32 items-center justify-center rounded-2xl bg-white shadow-card sm:flex">
              <Laptop className="h-12 w-12 text-blue-300" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-ink">What we skip on purpose</h2>
              <p className="mt-3 max-w-xl text-muted">
                No YouTube or Instagram downloaders. No “rewrite this so it passes Turnitin.” Ads, if they
                show up later, pay for hosting. You still get the answer without clicking one.
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm font-medium text-ink">
            {[
              "Free, no signup",
              "Works in Chrome, Firefox, Safari",
              "Privacy and contact pages are real",
              "Writing tools are for your own drafts",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
