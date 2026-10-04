import type { CategoryId, IconTint } from "./types";

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
  href: string;
  icon: string;
  iconTint: IconTint;
  countLabel: string;
};

export const categories: Category[] = [
  {
    id: "calculators",
    name: "Calculators",
    description: "BMI, loans, tips, dates, percentages — the usual stuff.",
    href: "/tools/calculators",
    icon: "Calculator",
    iconTint: "blue",
    countLabel: "28 tools",
  },
  {
    id: "student-tools",
    name: "Student Tools",
    description: "GPA, attendance, marks and exam countdown.",
    href: "/tools/student-tools",
    icon: "GraduationCap",
    iconTint: "green",
    countLabel: "11 tools",
  },
  {
    id: "writing",
    name: "Writing & Paraphrasing",
    description: "Rewrite and check your own draft. Don't paste someone else's essay.",
    href: "/tools/writing",
    icon: "PenLine",
    iconTint: "purple",
    countLabel: "23 tools",
  },
  {
    id: "image-tools",
    name: "Image Tools",
    description: "Resize, crop and compress photos on your computer.",
    href: "/tools/image-tools",
    icon: "Image",
    iconTint: "red",
    countLabel: "25 tools",
  },
  {
    id: "file-converters",
    name: "File Converters",
    description: "PDF, JPG, Word and plain text conversions.",
    href: "/tools/file-converters",
    icon: "FileText",
    iconTint: "amber",
    countLabel: "11 tools",
  },
  {
    id: "data-tools",
    name: "Data Tools",
    description: "JSON, CSV, XML and YAML. Paste, convert, copy.",
    href: "/tools/data-tools",
    icon: "Database",
    iconTint: "sky",
    countLabel: "6 tools",
  },
  {
    id: "media-tools",
    name: "Media Tools",
    description: "Compress, resize or convert a video you already have.",
    href: "/tools/media-tools",
    icon: "Clapperboard",
    iconTint: "rose",
    countLabel: "9 tools",
  },
  {
    id: "unit-converters",
    name: "Unit Converters",
    description: "Kg, pounds, °C, miles, liters, MB and GB.",
    href: "/tools/unit-converters",
    icon: "ArrowLeftRight",
    iconTint: "teal",
    countLabel: "18 tools",
  },
  {
    id: "developer-tools",
    name: "Developer Tools",
    description: "JSON, Base64, JWT, regex, hashes and minifiers.",
    href: "/tools/developer-tools",
    icon: "Code2",
    iconTint: "indigo",
    countLabel: "30 tools",
  },
];

export const converterGroups = [
  {
    id: "file-converters" as const,
    name: "Document",
    href: "/tools/file-converters",
    description: "PDF ↔ JPG, Word ↔ PDF, and TXT → PDF.",
  },
  {
    id: "image-tools" as const,
    name: "Image",
    href: "/tools/image-tools",
    description: "JPG, PNG, WebP and SVG conversions.",
  },
  {
    id: "data-tools" as const,
    name: "Data",
    href: "/tools/data-tools",
    description: "JSON, CSV, XML and YAML formatters.",
  },
  {
    id: "developer-tools" as const,
    name: "Developer",
    href: "/tools/developer-tools",
    description: "JSON, Base64, JWT, regex, minify and color tools.",
  },
];

export function getCategory(id: CategoryId) {
  return categories.find((category) => category.id === id);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.id === slug);
}
