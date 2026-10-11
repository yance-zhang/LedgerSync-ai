import * as React from "react";
import { cn } from "@/lib/utils";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive";
};

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  const variantClass =
    variant === "destructive"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : "border-border bg-card text-foreground";

  return (
    <div
      role="status"
      className={cn("relative w-full rounded-xl border p-4 text-sm", variantClass, className)}
      {...props}
    />
  );
}
