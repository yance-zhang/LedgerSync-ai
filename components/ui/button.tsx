import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
};

const variants = {
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  outline: "border border-input bg-background text-foreground shadow-sm hover:bg-muted",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
};

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-lg px-3 text-sm",
  lg: "h-12 rounded-xl px-6 text-base",
  icon: "size-10",
};

const baseClasses = [
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-medium",
  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
].join(" ");

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className"> = {}) {
  return cn(
    baseClasses,
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
