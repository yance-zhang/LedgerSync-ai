"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { InvoiceParsedSchema } from "@/lib/schemas/invoice";
import { getWorkspaceContext } from "@/lib/workspaces";

export async function getOrCreateWorkspace() {
  const { current } = await getWorkspaceContext();
  if (!current) throw new Error("Please sign in again to upload documents.");
  return current;
}

export async function saveDocumentReview(documentId: string, input: unknown) {
  const idResult = z.string().uuid().safeParse(documentId);
  const dataResult = InvoiceParsedSchema.safeParse(input);
  if (!idResult.success || !dataResult.success) {
    return { error: "Check the invoice details and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in again to save your review." };

  const { current } = await getWorkspaceContext();
  if (!current) return { error: "No active workspace is available." };

  const { data, error } = await supabase
    .from("documents")
    .update({ reviewed_data: dataResult.data, status: "confirmed", processing_error: null })
    .eq("id", idResult.data)
    .eq("organization_id", current.id)
    .not("parsed_data", "is", null)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { error: "Could not save your review. Check your workspace permissions and try again." };
  }

  revalidatePath(`/dashboard/documents/${idResult.data}`);
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/checklist");
  return { success: true };
}

export async function deleteDocument(documentId: string) {
  const idResult = z.string().uuid().safeParse(documentId);
  if (!idResult.success) return { error: "This document could not be found." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Please sign in again to delete this document." };

  const { current } = await getWorkspaceContext();
  if (!current) return { error: "No active workspace is available." };

  const { data: document, error: lookupError } = await supabase
    .from("documents")
    .select("id, storage_path")
    .eq("id", idResult.data)
    .eq("organization_id", current.id)
    .maybeSingle();

  if (lookupError || !document) return { error: "This document could not be found or accessed." };

  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([document.storage_path]);

  if (storageError) {
    console.error("Document storage deletion failed:", storageError);
    return { error: "The document file could not be deleted. Please try again." };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", document.id)
    .select("id")
    .maybeSingle();

  if (deleteError || !deleted) {
    console.error("Document record deletion failed:", deleteError);
    return { error: "The file was removed, but its record could not be deleted. Please contact your workspace admin." };
  }

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard/checklist");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/documents/${document.id}`);
  return { success: true };
}
