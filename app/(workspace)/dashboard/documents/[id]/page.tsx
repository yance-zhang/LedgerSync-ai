import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileImage, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

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
    .select("id, file_name, content_type, size_bytes, status, created_at, storage_path")
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
      <div className="mt-3 flex items-center gap-4">
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
              Status updates appear here as this document moves through review.
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

      {signed?.signedUrl ? (
        <Card className="mt-4 flex flex-col items-center gap-4 p-4 shadow-none">
          <div className="w-full overflow-hidden rounded-xl bg-muted">
            {isPdf ? (
              <iframe
                title={`Preview of ${document.file_name}`}
                src={signed.signedUrl}
                className="h-[min(66vh,720px)] w-full border-0"
              />
            ) : (
              <Image
                unoptimized
                width={1200}
                height={1000}
                src={signed.signedUrl}
                alt={document.file_name}
                className="mx-auto h-auto max-h-[70vh] w-auto object-contain"
              />
            )}
          </div>
          <a
            className={buttonVariants({ variant: "outline" })}
            href={signed.signedUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Download data-icon="inline-start" />
            Open original
          </a>
        </Card>
      ) : (
        <Card className="mt-4 border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          The private file is currently unavailable.
        </Card>
      )}
    </section>
  );
}
