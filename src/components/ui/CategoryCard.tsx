import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IconBadge } from "./IconBadge";
import type { Category } from "@/lib/categories";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={category.href}
      className="group rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card-hover"
    >
      <IconBadge name={category.icon} tint={category.iconTint} />
      <h3 className="mt-4 text-base font-semibold text-ink">{category.name}</h3>
      <p className="mt-1 text-sm leading-6 text-muted">{category.description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
        {category.countLabel}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
