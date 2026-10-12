"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "./actions";

export function DocumentDeleteButton({
  documentId,
  fileName,
  redirectAfterDelete = false,
}: {
  documentId: string;
  fileName: string;
  redirectAfterDelete?: boolean;
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete “${fileName}”? This permanently removes the document and its stored file.`,
    );
    if (!confirmed) return;

    setError("");
    startTransition(async () => {
      const result = await deleteDocument(documentId);
      if (result.error) {
        setError(result.error);
        return;
      }

      if (redirectAfterDelete) router.push("/dashboard/documents");
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleDelete}
        disabled={busy}
        aria-label={`Delete ${fileName}`}
      >
        {busy ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
        {busy ? "Deleting" : "Delete"}
      </Button>
      {error && <span role="alert" className="max-w-56 text-right text-xs text-destructive">{error}</span>}
    </span>
  );
}
