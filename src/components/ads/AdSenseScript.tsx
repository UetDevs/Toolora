"use client";

import { useEffect } from "react";
import { adsenseClient } from "@/lib/site";

export function AdSenseScript() {
  useEffect(() => {
    if (!adsenseClient) return;
    if (document.querySelector("script[data-toolora-adsense]")) return;
    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.tooloraAdsense = "true";
    document.head.appendChild(script);
  }, []);

  return null;
}
