"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Files, LayoutDashboard, ListChecks, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/documents", label: "Documents", icon: Files },
  { href: "/dashboard/checklist", label: "Ledger checklist", icon: ListChecks },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Workspace navigation">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-accent text-accent-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
