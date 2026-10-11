"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Files, LayoutDashboard, ListChecks, Settings } from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/documents", label: "Documents", icon: Files },
  { href: "/dashboard/checklist", label: "Ledger checklist", icon: ListChecks },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav className="workspace-nav" aria-label="Workspace navigation">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return (
          <Link key={href} href={href} className={`workspace-nav-link${active ? " nav-current" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />{label}
            {href === "/dashboard/documents" && <span className="nav-count">0</span>}
          </Link>
        );
      })}
    </nav>
  );
}
