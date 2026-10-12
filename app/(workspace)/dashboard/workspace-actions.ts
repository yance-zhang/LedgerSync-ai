"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { ACTIVE_WORKSPACE_COOKIE, getWorkspaceContext } from "@/lib/workspaces";
import { createClient } from "@/lib/supabase/server";

const nameSchema = z.string().trim().min(1, "Enter a workspace name.").max(80, "Use 80 characters or fewer.");

export async function switchWorkspace(workspaceId: string) {
  const id = z.string().uuid().safeParse(workspaceId);
  if (!id.success) return { error: "Choose a valid workspace." };
  const { workspaces } = await getWorkspaceContext();
  if (!workspaces.some((workspace) => workspace.id === id.data)) return { error: "Workspace not found." };
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, id.data, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function createWorkspace(formData: FormData) {
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter a valid workspace name." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };
  const { data, error } = await supabase.from("organizations").insert({ name: parsed.data, created_by: user.id }).select("id").single();
  if (error || !data) return { error: "Could not create the workspace. Please try again." };
  await switchWorkspace(data.id);
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function renameWorkspace(workspaceId: string, formData: FormData) {
  const id = z.string().uuid().safeParse(workspaceId);
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!id.success) return { error: "Workspace not found." };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter a valid workspace name." };
  const { current } = await getWorkspaceContext();
  if (current?.id !== id.data || !["owner", "admin"].includes(current.role)) return { error: "You do not have permission to rename this workspace." };
  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update({ name: parsed.data }).eq("id", id.data);
  if (error) return { error: "Could not rename the workspace." };
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function deleteWorkspace(workspaceId: string) {
  const id = z.string().uuid().safeParse(workspaceId);
  if (!id.success) return { error: "Workspace not found." };
  const { workspaces, current } = await getWorkspaceContext();
  const workspace = workspaces.find((item) => item.id === id.data);
  if (current?.id !== id.data) return { error: "Switch to this workspace before deleting it." };
  if (!workspace || workspace.role !== "owner") return { error: "Only a workspace owner can delete it." };
  if (workspaces.length < 2) return { error: "Create another workspace before deleting the last one." };
  const supabase = await createClient();
  const { data: documents, error: listError } = await supabase.from("documents").select("storage_path").eq("organization_id", id.data);
  if (listError) return { error: "Could not prepare this workspace for deletion." };
  const paths = (documents ?? []).map((document) => document.storage_path);
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from("documents").remove(paths);
    if (storageError) return { error: "Could not remove workspace files. Please try again." };
  }
  const { error } = await supabase.from("organizations").delete().eq("id", id.data);
  if (error) return { error: "Could not delete the workspace." };
  const cookieStore = await cookies();
  if (cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value === id.data) {
    const nextWorkspace = workspaces.find((item) => item.id !== id.data);
    if (nextWorkspace) cookieStore.set(ACTIVE_WORKSPACE_COOKIE, nextWorkspace.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
