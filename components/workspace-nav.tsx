"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Files, LayoutDashboard, ListChecks, Settings, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/lib/workspaces";
import { switchWorkspace } from "@/app/(workspace)/dashboard/workspace-actions";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/documents", label: "Documents", icon: Files },
  { href: "/dashboard/checklist", label: "Ledger checklist", icon: ListChecks },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function WorkspaceNav({ workspaces, currentWorkspace }: { workspaces: Workspace[]; currentWorkspace: Workspace }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, startTransition] = useTransition();

  function selectWorkspace(workspaceId: string) {
    startTransition(async () => {
      const result = await switchWorkspace(workspaceId);
      if (result.success) router.refresh();
    });
  }

  return (
    <div>
      <label className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Current workspace</span>
          <select aria-label="Switch workspace" disabled={busy} value={currentWorkspace.id} onChange={(event) => selectWorkspace(event.target.value)} className="mt-1 w-full truncate bg-transparent text-sm font-semibold outline-none">
            {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
          </select>
        </span>
        <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      </label>
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
    </div>
  );
}
