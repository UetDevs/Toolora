import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" aria-hidden>
          <path
            d="M7 7.5 12 12m0 0 5-4.5M12 12l-5 4.5M12 12l5 4.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "text-lg font-extrabold tracking-tight",
          inverted ? "text-white" : "text-ink",
        )}
      >
        Toolora
      </span>
    </Link>
  );
}
