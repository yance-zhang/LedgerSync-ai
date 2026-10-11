import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string;
  tone?: "default" | "inverse";
};

export function Brand({ className, tone = "default" }: BrandProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center gap-3 font-semibold tracking-tight",
        tone === "inverse" ? "text-primary-foreground" : "text-foreground",
        className,
      )}
      href="/"
      aria-label="LedgerSync AI home"
    >
      <span
        className={cn(
          "grid size-10 place-items-center rounded-xl text-xs font-bold tracking-normal",
          tone === "inverse"
            ? "bg-primary-foreground text-primary"
            : "bg-primary text-primary-foreground",
        )}
      >
        LS
      </span>
      <span className="text-base">
        LedgerSync{" "}
        <span className={tone === "inverse" ? "text-forest-light" : "text-primary"}>
          AI
        </span>
      </span>
    </Link>
  );
}
