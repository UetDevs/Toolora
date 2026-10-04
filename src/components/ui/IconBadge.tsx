import { iconMap } from "@/lib/icon-map";
import type { IconTint } from "@/lib/types";
import { cn } from "@/lib/utils";

const tintClasses: Record<IconTint, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-violet-50 text-violet-600",
  red: "bg-rose-50 text-rose-500",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  rose: "bg-rose-50 text-rose-500",
  indigo: "bg-indigo-50 text-indigo-600",
  orange: "bg-orange-50 text-orange-500",
  teal: "bg-teal-50 text-teal-600",
  slate: "bg-slate-100 text-slate-600",
  violet: "bg-violet-50 text-violet-600",
};

export function IconBadge({
  name,
  tint,
  size = "md",
}: {
  name: string;
  tint: IconTint;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = iconMap[name];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        tintClasses[tint],
        size === "sm" && "h-10 w-10",
        size === "md" && "h-11 w-11",
        size === "lg" && "h-14 w-14",
      )}
    >
      {Icon ? <Icon className={size === "lg" ? "h-6 w-6" : "h-5 w-5"} strokeWidth={1.8} /> : null}
    </span>
  );
}
