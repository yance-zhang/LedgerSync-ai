import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspaces";
import { WorkspaceManager } from "./workspace-manager";

export default async function SettingsPage() {
  const [{ workspaces, current }, supabase] = await Promise.all([getWorkspaceContext(), createClient()]);
  const { data: documents } = workspaces.length
    ? await supabase.from("documents").select("organization_id").in("organization_id", workspaces.map((workspace) => workspace.id))
    : { data: [] };
  const counts = new Map<string, number>();
  for (const document of documents ?? []) counts.set(document.organization_id, (counts.get(document.organization_id) ?? 0) + 1);

  return (
    <section className="py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">Your preferences</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage your workspaces and keep each set of records organized.</p>
      <WorkspaceManager
        workspaces={workspaces.map((workspace) => ({ ...workspace, active: workspace.id === current?.id, documentCount: counts.get(workspace.id) ?? 0 }))}
      />
    </section>
  );
}
