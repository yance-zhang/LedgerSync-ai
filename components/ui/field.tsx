import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export function FieldGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-5", className)} {...props} />;
}

export function Field({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={className} {...props} />;
}

export function FieldDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
