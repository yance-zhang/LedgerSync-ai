import { DocumentLibrary } from "./document-library";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspaces";

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { current } = await getWorkspaceContext();
  const organizationId = current?.id;

  const { data } = organizationId
    ? await supabase
        .from("documents")
        .select("id, file_name, content_type, size_bytes, status, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">
        Your paper trail
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Documents</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Receipts and invoices, organized in one place.
      </p>
      <DocumentLibrary documents={data ?? []} />
    </section>
  );
}
