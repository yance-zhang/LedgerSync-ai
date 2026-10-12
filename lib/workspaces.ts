import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const ACTIVE_WORKSPACE_COOKIE = "ledgersync_active_workspace";

export type Workspace = { id: string; name: string; role: string };

function getOrganization(value: unknown): { id: string; name: string } | null {
  const organization = Array.isArray(value) ? value[0] : value;
  if (!organization || typeof organization !== "object") return null;
  const item = organization as { id?: unknown; name?: unknown };
  return typeof item.id === "string" && typeof item.name === "string"
    ? { id: item.id, name: item.name }
    : null;
}

export async function getWorkspaceContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { workspaces: [] as Workspace[], current: null as Workspace | null };

  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name)")
    .eq("user_id", user.id);

  if (error) throw new Error("Could not load your workspaces.");

  let workspaces = (memberships ?? []).flatMap((membership) => {
    const organization = getOrganization(membership.organizations);
    return organization ? [{ ...organization, role: membership.role }] : [];
  });

  if (workspaces.length === 0) {
    const { data: created, error: createError } = await supabase
      .from("organizations")
      .insert({ name: "My workspace", created_by: user.id })
      .select("id, name")
      .single();
    if (createError || !created) throw new Error("Could not create your workspace.");
    workspaces = [{ ...created, role: "owner" }];
  }

  const cookieStore = await cookies();
  const requestedId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;
  const current = workspaces.find((workspace) => workspace.id === requestedId) ?? workspaces[0];
  return { workspaces, current };
}
