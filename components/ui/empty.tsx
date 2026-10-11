import * as React from "react";
import { cn } from "@/lib/utils";

const emptyClasses = [
  "flex min-h-64 flex-col items-center justify-center rounded-2xl",
  "border border-dashed border-border bg-card/60 px-6 py-12 text-center",
].join(" ");

const mediaClasses = [
  "mb-4 grid size-12 place-items-center rounded-2xl",
  "bg-accent text-accent-foreground",
].join(" ");

export function Empty({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(emptyClasses, className)}
      {...props}
    />
  );
}

export function EmptyMedia({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(mediaClasses, className)}
      {...props}
    />
  );
}

export function EmptyTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-base font-semibold tracking-tight", className)} {...props} />
  );
}

export function EmptyDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-1 max-w-sm text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}
