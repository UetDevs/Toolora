import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calculator } from "lucide-react";
import { IconBadge } from "@/components/ui/IconBadge";
import { ToolCard } from "@/components/ui/ToolCard";
import { categories, converterGroups, getCategoryBySlug } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/tools";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  const items = getToolsByCategory(category.id);
  const isCalculators = category.id === "calculators";
  const isStudents = category.id === "student-tools";
  const isWriting = category.id === "writing";
  const isImages = category.id === "image-tools";
  const isDocuments = category.id === "file-converters";
  const isData = category.id === "data-tools";
  const isDevelopers = category.id === "developer-tools";
  const isMedia = category.id === "media-tools";
  const isUnits = category.id === "unit-converters";
  const showConverterGroups = isDocuments || isData || isDevelopers;

  return (
    <div className="bg-gradient-to-b from-blue-50/80 to-canvas">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-line bg-white/80 px-6 py-8 shadow-card sm:px-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-brand">
                <Calculator className="h-3.5 w-3.5" />
                {category.name}
              </p>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {isCalculators
                  ? "Calculators"
                  : isStudents
                    ? "Student tools"
                    : isWriting
                      ? "Writing tools"
                        : isImages
                        ? "Image tools"
                        : isMedia
                          ? "Media tools"
                          : isUnits
                            ? "Unit converters"
                            : category.name}
              </h1>
              <p className="mt-3 max-w-2xl text-muted">
                {isCalculators
                  ? "BMI, age, loans, tips, dates, percentages. Type the numbers, get the answer."
                  : isStudents
                    ? "GPA, attendance, marks and how many days until the exam."
                    : isWriting
                      ? "Rewrite or check a draft you wrote. Do not paste someone else's essay."
                      : isImages
                        ? "Resize, crop, compress or convert a photo. It stays on your computer."
                        : isDocuments
                          ? "PDF, JPG, Word and TXT. Image and data converters are in their own lists."
                          : isData
                            ? "Paste JSON, CSV, XML or YAML. Convert it. Copy it back."
                            : isDevelopers
                              ? "Base64, URLs, JWT, regex, hashes, timestamps and minifiers."
                              : isMedia
                                ? "Compress or convert a video you already have. We do not grab clips from YouTube or Instagram."
                                : isUnits
                                  ? "Kg and pounds, °C and °F, km and miles, liters, MB and GB."
                                  : category.description}
              </p>
            </div>
            {isCalculators ? <CalculatorArt /> : <IconBadge name={category.icon} tint={category.iconTint} size="lg" />}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-2xl border border-line bg-white p-3 shadow-card">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-subtle">Categories</p>
            {categories.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${
                  item.id === category.id ? "bg-blue-50 font-semibold text-brand" : "text-muted hover:bg-slate-50"
                }`}
              >
                <span>{item.name}</span>
                <span className="text-xs">{item.countLabel}</span>
              </Link>
            ))}
          </aside>

          <div>
            {showConverterGroups ? (
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                {converterGroups.map((group) => (
                  <Link
                    key={group.id}
                    href={group.href}
                    className={`rounded-2xl border p-4 shadow-card ${
                      group.id === category.id ? "border-brand bg-blue-50" : "border-line bg-white hover:border-brand/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink">{group.name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{group.description}</p>
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-ink">
                  {items.length} {category.name}
                </h2>
                <p className="text-sm text-muted">{category.description}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
            <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center">
              <p className="text-sm text-muted">Looking for a different tool? Search or open the full list.</p>
              <Link
                href="/tools"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-hover"
              >
                Browse All Tools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalculatorArt() {
  return (
    <div className="hidden h-28 w-36 items-center justify-center rounded-3xl bg-blue-50 lg:flex">
      <Calculator className="h-14 w-14 text-blue-400" />
    </div>
  );
}
