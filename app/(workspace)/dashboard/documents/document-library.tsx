"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  AlertCircle,
  Check,
  FileImage,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getOrCreateWorkspace } from "./actions";

type Document = {
  id: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  status: string;
  created_at: string;
};

const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const statusLabels: Record<string, string> = {
  uploaded: "Uploaded",
  processing: "Processing",
  needs_review: "Needs review",
  confirmed: "Confirmed",
  failed: "Failed",
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentLibrary({ documents }: { documents: Document[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function upload(files: FileList | null) {
    if (!files?.length) return;

    setError("");
    setNotice("");
    const file = files[0];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a PDF, JPG, PNG, or WebP file.");
      return;
    }

    if (!file.size || file.size > 25 * 1024 * 1024) {
      setError("Each file must be smaller than 25 MB.");
      return;
    }

    startTransition(async () => {
      try {
        const workspace = await getOrCreateWorkspace();
        const { url, anonKey } = getSupabaseEnv();
        const supabase = createBrowserClient(url, anonKey);
        const { data: auth } = await supabase.auth.getUser();

        if (!auth.user) throw new Error("Please sign in again to upload documents.");

        const id = crypto.randomUUID();
        const safeName = file.name.replace(/[\\/]/g, "-").slice(0, 255) || "document";
        const path = `${workspace.id}/${id}/${safeName}`;
        const { error: rowError } = await supabase.from("documents").insert({
          id,
          organization_id: workspace.id,
          uploaded_by: auth.user.id,
          file_name: safeName,
          storage_path: path,
          content_type: file.type,
          size_bytes: file.size,
          status: "uploaded",
        });

        if (rowError) {
          throw new Error(rowError.message || "Could not save document details.");
        }

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(path, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          await supabase.from("documents").update({ status: "failed" }).eq("id", id);
          throw new Error(uploadError.message || "File upload failed.");
        }

        setNotice(`${safeName} uploaded and added to your library.`);
        router.refresh();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Upload failed. Please try again.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="pb-8">
      <Input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        onChange={(event) => upload(event.target.files)}
      />

      <Card
        className="mt-8 flex flex-col items-start gap-5 border-dashed bg-card/70 p-5 shadow-none sm:flex-row sm:items-center sm:p-6"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          upload(event.dataTransfer.files);
        }}
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
          <UploadCloud className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Bring your paperwork together.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop a PDF or image here, or choose a file. Up to 25 MB.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">PDF · JPG · PNG · WebP</p>
        </div>
        <Button disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? (
            <>
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Plus data-icon="inline-start" />
              Upload document
            </>
          )}
        </Button>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </Alert>
      )}
      {notice && (
        <Alert className="mt-4 flex items-center gap-2 border-emerald-200 bg-emerald-50 text-emerald-900">
          <Check className="size-4 shrink-0" />
          {notice}
        </Alert>
      )}

      <div className="mb-3 mt-9 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Your files
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            All documents <Badge variant="outline" className="ml-1 align-middle">{documents.length}</Badge>
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.refresh()}>
          <RefreshCw data-icon="inline-start" />
          Refresh status
        </Button>
      </div>

      {documents.length ? (
        <Card className="overflow-hidden shadow-none">
          <div className="divide-y divide-border">
            {documents.map((document) => (
              <Link
                className="flex min-h-18 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60 sm:gap-4 sm:px-5"
                href={`/dashboard/documents/${document.id}`}
                key={document.id}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                  {document.content_type === "application/pdf" ? (
                    <FileText className="size-5" />
                  ) : (
                    <FileImage className="size-5" />
                  )}
                </span>
                <span className="grid min-w-0 flex-1 gap-1">
                  <strong className="truncate text-sm font-medium">{document.file_name}</strong>
                  <small className="text-xs text-muted-foreground">
                    {formatSize(document.size_bytes)}
                    <span className="px-1">·</span>
                    {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                      new Date(document.created_at),
                    )}
                  </small>
                </span>
                <Badge
                  variant={
                    document.status === "failed"
                      ? "destructive"
                      : document.status === "confirmed"
                        ? "default"
                        : document.status === "needs_review"
                          ? "outline"
                          : "secondary"
                  }
                  className="shrink-0"
                >
                  {statusLabels[document.status] ?? document.status}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      ) : (
        <Empty className="mt-4">
          <EmptyMedia>
            <FileText className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Your document space is ready.</EmptyTitle>
          <EmptyDescription>Upload a receipt or invoice to start your paper trail.</EmptyDescription>
        </Empty>
      )}
    </div>
  );
}
