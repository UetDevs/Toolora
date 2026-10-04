import { ToolPageLayout } from "./ToolPageLayout";
import type { Tool } from "@/lib/types";

export function ComingSoon({ tool }: { tool: Tool }) {
  return (
    <ToolPageLayout tool={tool}>
      <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <p className="text-sm font-semibold text-brand">Coming soon</p>
        <h2 className="mt-2 text-2xl font-bold text-ink">{tool.name} is not ready yet</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
          This page is still empty. The rest of the site works. Check back later, or write if you
          actually need this one.
        </p>
      </div>
    </ToolPageLayout>
  );
}
