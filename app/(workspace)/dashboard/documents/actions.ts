"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrCreateWorkspace() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Please sign in again to upload documents.");

  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(id, name)")
    .eq("user_id", user.id)
    .limit(1);

  if (error) throw new Error("Could not load your workspace.");

  const first = memberships?.[0];
  const organization = Array.isArray(first?.organizations)
    ? first.organizations[0]
    : first?.organizations;

  if (first && organization) {
    return { id: first.organization_id, name: organization.name as string };
  }

  const { data: created, error: createError } = await supabase
    .from("organizations")
    .insert({ name: "My workspace", created_by: user.id })
    .select("id, name")
    .single();

  if (createError || !created) {
    console.error("Workspace creation failed:", createError);
    throw new Error("Could not create your workspace. Please refresh and try again.");
  }
  return created;
}
