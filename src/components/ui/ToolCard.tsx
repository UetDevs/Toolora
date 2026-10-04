import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IconBadge } from "./IconBadge";
import type { Tool } from "@/lib/types";

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card-hover"
    >
      <IconBadge name={tool.icon} tint={tool.iconTint} />
      <h3 className="mt-4 text-base font-semibold text-ink">{tool.name}</h3>
      <p className="mt-1 flex-1 text-sm leading-6 text-muted">{tool.description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
        {tool.status === "soon" ? "Coming soon" : "Open tool"}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
