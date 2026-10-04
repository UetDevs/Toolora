import type { ReactNode } from "react";

export function Article({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-4xl font-extrabold tracking-tight text-ink">{title}</h1>
      {updated ? <p className="mt-2 text-sm text-subtle">Last updated: {updated}</p> : null}
      <div className="mt-6 space-y-4 text-base leading-7 text-muted [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}
