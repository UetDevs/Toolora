"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { FaqItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-ink">{item.question}</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-subtle transition",
                  isOpen && "rotate-90 text-brand",
                )}
              />
            </button>
            {isOpen ? <p className="pb-4 text-sm leading-6 text-muted">{item.answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
