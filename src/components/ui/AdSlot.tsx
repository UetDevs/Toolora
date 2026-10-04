"use client";

import { useEffect, useRef } from "react";
import { adsenseClient, adsenseSlot } from "@/lib/site";

export function AdSlot({ label = "Advertisement" }: { label?: string }) {
  const loaded = useRef(false);

  useEffect(() => {
    if (!adsenseClient || !adsenseSlot || loaded.current) return;
    loaded.current = true;
    try {
      ((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle ??= []).push({});
    } catch {
      /* ignore */
    }
  }, []);

  if (!adsenseClient || !adsenseSlot) return null;

  return (
    <aside aria-label={label} className="overflow-hidden rounded-2xl border border-line bg-slate-50">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseClient}
        data-ad-slot={adsenseSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
