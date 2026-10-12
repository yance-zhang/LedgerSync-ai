"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw, ScanText } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ExtractionControl({
  documentId,
  status,
}: {
  documentId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "processing") return;
    const timer = window.setInterval(() => router.refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [router, status]);

  function extract() {
    setError("");
    startTransition(async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/extract`, { method: "POST" });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not start extraction.");
        router.refresh();
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not start extraction.");
      }
    });
  }

  if (status === "processing") {
    return (
      <Alert className="mt-5 flex items-center gap-3">
        <LoaderCircle className="size-4 animate-spin" />
        Reading the document. This page will refresh when the review is ready.
      </Alert>
    );
  }

  return (
    <div className="mt-5">
      {error && <Alert variant="destructive" className="mb-3">{error}</Alert>}
      <Button variant="outline" onClick={extract} disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : status === "failed" ? <RefreshCw /> : <ScanText />}
        {pending ? "Starting extraction" : status === "failed" ? "Try extraction again" : "Extract details"}
      </Button>
    </div>
  );
}
