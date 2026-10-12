import { redirect } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { WorkspaceNav } from "@/components/workspace-nav";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspaces";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  const { workspaces, current } = await getWorkspaceContext();
  if (!current) redirect("/login");

  const email = user.email ?? "Your account";
  const initials = email.slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card px-4 py-3 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r md:px-5 md:py-6">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <form action={signOut} className="md:hidden">
            <Button type="submit" size="icon" variant="ghost" aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>

        <p className="mb-3 mt-8 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:block">
          Workspace
        </p>
        <WorkspaceNav workspaces={workspaces} currentWorkspace={current} />

        <div className="mt-auto hidden md:block">
          <div className="rounded-2xl bg-secondary p-4">
            <Sparkles className="mb-3 size-4 text-primary" />
            <p className="text-sm font-semibold">Here for the details.</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Your records stay organized, one step at a time.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              {initials}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{email}</span>
            <form action={signOut}>
              <Button type="submit" size="icon" variant="ghost" aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-5 sm:px-8 lg:px-12">
        <header className="flex h-14 items-center justify-between border-b border-border text-xs text-muted-foreground">
          <p>
            {current.name} <span className="px-2 text-border">/</span> LedgerSync AI
          </p>
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" />
            Private workspace
          </span>
        </header>
        <div className="mx-auto w-full max-w-6xl">{children}</div>
        <footer className="py-8 text-center text-xs text-muted-foreground">
          Made for a clearer month-end <span className="px-1">·</span> LedgerSync AI
        </footer>
      </main>
    </div>
  );
}
