import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://toolora.app";
  const staticRoutes = [
    "",
    "/tools",
    "/guides",
    "/about",
    "/contact",
    "/privacy-policy",
    "/cookie-policy",
    "/terms",
    "/disclaimer",
    "/guides/how-to-calculate-bmi",
    "/guides/how-loan-payments-work",
    "/guides/how-to-paraphrase-your-own-writing",
    "/guides/keep-files-private-in-browser-tools",
    "/guides/how-to-convert-kg-to-lbs",
    "/guides/what-is-a-unix-timestamp",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })),
    ...categories.map((category) => ({
      url: `${base}${category.href}`,
      lastModified: new Date(),
    })),
    ...tools.map((tool) => ({
      url: `${base}${tool.href}`,
      lastModified: new Date(),
    })),
  ];
}
