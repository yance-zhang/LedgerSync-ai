import * as React from "react";
import { cn } from "@/lib/utils";

const baseClasses = [
  "flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2",
  "text-sm text-foreground shadow-sm outline-none transition",
  "placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(baseClasses, className)}
      {...props}
    />
  ),
);

Input.displayName = "Input";
