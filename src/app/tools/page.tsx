import { ToolCard } from "@/components/ui/ToolCard";
import { categories } from "@/lib/categories";
import { searchTools, tools } from "@/lib/tools";

export const metadata = {
  title: "All Tools",
  description: "Every Toolora calculator, converter and utility on one page.",
};

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const filtered = q ? searchTools(q) : tools;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">All Tools</h1>
      <p className="mt-2 max-w-2xl text-muted">
        {q ? `Results for “${q}”.` : "Everything in one place, grouped by category."}
      </p>
      {categories.map((category) => {
        const items = filtered.filter((tool) => tool.category === category.id);
        if (!items.length) return null;
        return (
          <section key={category.id} className="mt-10">
            <h2 className="text-xl font-bold text-ink">{category.name}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
