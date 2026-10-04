export type CategoryId =
  | "calculators"
  | "student-tools"
  | "writing"
  | "image-tools"
  | "file-converters"
  | "data-tools"
  | "media-tools"
  | "unit-converters"
  | "developer-tools";

export type ToolStatus = "ready" | "soon";

export type IconTint =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "amber"
  | "sky"
  | "rose"
  | "indigo"
  | "orange"
  | "teal"
  | "slate"
  | "violet";

export type FaqItem = {
  question: string;
  answer: string;
};

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: CategoryId;
  href: string;
  icon: string;
  iconTint: IconTint;
  popular?: boolean;
  status: ToolStatus;
  keywords: string[];
  badge?: string;
  longDescription?: string;
  faqs?: FaqItem[];
};
