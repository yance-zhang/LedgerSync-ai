import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileImage, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { InvoiceParsedSchema } from "@/lib/schemas/invoice";
import { ExtractionControl } from "../extraction-control";
import { InvoiceReviewForm } from "../invoice-review-form";
import { DocumentPreview } from "../document-preview";
import { DocumentDeleteButton } from "../document-delete-button";

const labels: Record<string, string> = {
  uploaded: "Uploaded",
  processing: "Processing",
  needs_review: "Needs review",
  confirmed: "Confirmed",
  failed: "Failed",
};

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: document } = await supabase
    .from("documents")
    .select("id, file_name, content_type, size_bytes, status, created_at, storage_path, parsed_data, reviewed_data, processing_error")
    .eq("id", id)
    .maybeSingle();

  if (!document) notFound();

  const { data: signed } = await supabase.storage
    .from("documents")
    .createSignedUrl(document.storage_path, 60 * 5);
  const isPdf = document.content_type === "application/pdf";
  const statusVariant =
    document.status === "failed"
      ? "destructive"
      : document.status === "confirmed"
        ? "default"
        : "secondary";
  const parsedData = InvoiceParsedSchema.safeParse(document.reviewed_data ?? document.parsed_data);
  const formattedSize =
    document.size_bytes < 1024 * 1024
      ? `${Math.round(document.size_bytes / 1024)} KB`
      : `${(document.size_bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <section className="py-10 sm:py-14">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        href="/dashboard/documents"
      >
        <ArrowLeft className="size-4" />
        All documents
      </Link>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">
        Document details
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
            {isPdf ? <FileText className="size-5" /> : <FileImage className="size-5" />}
          </span>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
              {document.file_name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Added{" "}
              {new Intl.DateTimeFormat("en", {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "America/Edmonton",
              }).format(new Date(document.created_at))}
            </p>
          </div>
        </div>
        <DocumentDeleteButton
          documentId={document.id}
          fileName={document.file_name}
          redirectAfterDelete
        />
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Card className="shadow-none">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Processing status
            </p>
            <Badge variant={statusVariant} className="mt-3">
              {labels[document.status] ?? document.status}
            </Badge>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {document.status === "confirmed"
                ? "You reviewed and confirmed these details."
                : document.status === "needs_review"
                  ? "Check the extracted fields against the original file."
                  : document.status === "failed"
                    ? document.processing_error ?? "Extraction could not be completed."
                    : document.status === "processing"
                      ? "The document is being read."
                      : "Start extraction to prepare the details for review."}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              File
            </p>
            <p className="mt-3 text-sm font-medium">{document.content_type}</p>
            <p className="mt-1 text-sm text-muted-foreground">{formattedSize}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-1 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-6">
        <div className="min-w-0">
          {parsedData.success ? (
            <InvoiceReviewForm documentId={document.id} initialData={parsedData.data} />
          ) : (
            <ExtractionControl documentId={document.id} status={document.status} />
          )}
        </div>

        <div className="min-w-0">
          {signed?.signedUrl ? (
            <DocumentPreview
              fileName={document.file_name}
              isPdf={isPdf}
              signedUrl={signed.signedUrl}
            />
          ) : (
            <Card className="mt-5 border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive shadow-none">
              The private file is currently unavailable.
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
