"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adsenseClient } from "@/lib/site";

const KEY = "toolora-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!adsenseClient) return;
    try {
      setVisible(!window.localStorage.getItem(KEY));
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function choose(value: "accepted" | "essential") {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 p-4 shadow-card-hover backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted">
          Toolora uses optional cookies for Google ads when they are enabled. See the{" "}
          <Link href="/cookie-policy" className="font-semibold text-brand">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="h-10 rounded-full border border-line px-4 text-sm font-semibold text-ink"
            onClick={() => choose("essential")}
          >
            Essential only
          </button>
          <button
            type="button"
            className="h-10 rounded-full bg-brand px-4 text-sm font-semibold text-white"
            onClick={() => choose("accepted")}
          >
            Accept ads cookies
          </button>
        </div>
      </div>
    </div>
  );
}
