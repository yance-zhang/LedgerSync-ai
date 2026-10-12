"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, FolderKanban, Plus, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createWorkspace, deleteWorkspace, renameWorkspace } from "../workspace-actions";
import type { Workspace } from "@/lib/workspaces";

type WorkspaceWithCount = Workspace & { documentCount: number; active: boolean };

export function WorkspaceManager({ workspaces }: { workspaces: WorkspaceWithCount[] }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function submit(action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>, form: HTMLFormElement) {
    const formData = new FormData(form);
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await action(formData);
      if (result.error) setError(result.error);
      else {
        setNotice("Workspace saved.");
        form.reset();
        router.refresh();
      }
    });
  }

  function remove(workspace: WorkspaceWithCount) {
    if (!window.confirm(`Delete “${workspace.name}” and its ${workspace.documentCount} document${workspace.documentCount === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await deleteWorkspace(workspace.id);
      if (result.error) setError(result.error);
      else {
        setNotice("Workspace deleted.");
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-8 space-y-5">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FolderKanban className="size-5 text-primary" /> Workspaces</CardTitle>
          <CardDescription>Each workspace keeps its documents and ledger checklist separate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {workspaces.map((workspace) => (
            <div key={workspace.id} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <form className="flex min-w-0 flex-wrap items-center gap-2" onSubmit={(event) => { event.preventDefault(); submit((data) => renameWorkspace(workspace.id, data), event.currentTarget); }}>
                <Input aria-label={`Workspace name for ${workspace.name}`} name="name" defaultValue={workspace.name} maxLength={80} className="min-w-40 flex-1" disabled={!workspace.active || (workspace.role !== "owner" && workspace.role !== "admin")} />
                {workspace.active && <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"><Check className="size-3.5" /> Active</span>}
                <span className="text-xs text-muted-foreground">{workspace.documentCount} {workspace.documentCount === 1 ? "document" : "documents"} · {workspace.role}</span>
                {workspace.active && (workspace.role === "owner" || workspace.role === "admin") && <Button type="submit" size="sm" variant="outline" disabled={busy}>Save name</Button>}
              </form>
              <div className="flex justify-end">
                {workspace.active && workspace.role === "owner" && workspaces.length > 1 && <Button type="button" size="icon" variant="ghost" aria-label={`Delete ${workspace.name}`} onClick={() => remove(workspace)} disabled={busy}><Trash2 className="size-4 text-destructive" /></Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Create a workspace</CardTitle>
          <CardDescription>Use separate workspaces for different businesses, clients, or sets of books.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); submit(createWorkspace, event.currentTarget); }}>
            <Input name="name" placeholder="For example, Northstar Studio" aria-label="New workspace name" maxLength={80} required className="sm:max-w-md" />
            <Button type="submit" disabled={busy}><Plus data-icon="inline-start" /> Create workspace</Button>
          </form>
          {error && <Alert variant="destructive" className="mt-4">{error}</Alert>}
          {notice && <p role="status" className="mt-3 text-sm text-muted-foreground">{notice}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
