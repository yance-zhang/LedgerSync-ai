import Link from "next/link";
import { AlertCircle, ArrowUpRight, Check, CircleDashed, FileText, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InvoiceParsedSchema } from "@/lib/schemas/invoice";
import { createClient } from "@/lib/supabase/server";
import { ChecklistPeriods } from "./checklist-periods";
import { getWorkspaceContext } from "@/lib/workspaces";

type DocumentRow = {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  reviewed_data: unknown;
};

export default async function ChecklistPage() {
  const supabase = await createClient();
  const { current } = await getWorkspaceContext();
  const organizationId = current?.id;
  const { data } = organizationId
    ? await supabase
        .from("documents")
        .select("id, file_name, status, created_at, reviewed_data")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
    : { data: [] };

  const documents = (data ?? []) as DocumentRow[];
  const confirmed = documents.flatMap((document) => {
    if (document.status !== "confirmed") return [];
    const parsed = InvoiceParsedSchema.safeParse(document.reviewed_data);
    return parsed.success ? [{ document, invoice: parsed.data }] : [];
  });
  const periods = new Map<string, typeof confirmed>();
  confirmed.forEach((entry) => {
    const monthKey = /^\d{4}-\d{2}-\d{2}$/.test(entry.invoice.invoiceDate)
      ? entry.invoice.invoiceDate.slice(0, 7)
      : "date-needs-review";
    periods.set(monthKey, [...(periods.get(monthKey) ?? []), entry]);
  });
  const formatPeriod = (monthKey: string) =>
    monthKey === "date-needs-review"
      ? "Date needs review"
      : new Intl.DateTimeFormat("en", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(`${monthKey}-01T12:00:00Z`));
  const orderedPeriods = [...periods]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([key, entries]) => ({ key, entries, label: formatPeriod(key) }));
  const pending = documents.filter((document) => ["uploaded", "processing", "needs_review"].includes(document.status));
  const failed = documents.filter((document) => document.status === "failed");
  const invalidConfirmed = documents.filter(
    (document) => document.status === "confirmed" && !InvoiceParsedSchema.safeParse(document.reviewed_data).success,
  );

  return (
    <section className="py-10 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">
        Month-end, made clear
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Ledger checklist</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confirmed documents grouped by category, with items that may need your attention.
      </p>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Confirmed records</p>
          <h2 className="mt-1 text-2xl font-semibold">All periods</h2>
        </div>
        <Badge variant="outline" className="gap-2 bg-card">
          <Check className="size-3.5 text-primary" />
          {confirmed.length} confirmed {confirmed.length === 1 ? "document" : "documents"}
        </Badge>
      </div>

      {(pending.length > 0 || failed.length > 0 || invalidConfirmed.length > 0) && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {pending.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5 shadow-none">
              <CardContent className="flex gap-3 p-4">
                <CircleDashed className="mt-0.5 size-4 shrink-0 text-amber-700" />
                <div>
                  <p className="text-sm font-semibold">{pending.length} document{pending.length === 1 ? "" : "s"} still need review</p>
                  <p className="mt-1 text-xs text-muted-foreground">Only confirmed records are included in the category checklist.</p>
                  <Link className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary" href="/dashboard/documents">
                    Review documents <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          {(failed.length > 0 || invalidConfirmed.length > 0) && (
            <Card className="border-destructive/30 bg-destructive/5 shadow-none">
              <CardContent className="flex gap-3 p-4">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-semibold">{failed.length + invalidConfirmed.length} document{failed.length + invalidConfirmed.length === 1 ? "" : "s"} have an exception</p>
                  <p className="mt-1 text-xs text-muted-foreground">A failed upload or incomplete confirmed record may need attention.</p>
                  <Link className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary" href="/dashboard/documents">
                    Open documents <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {confirmed.length === 0 ? (
        <Empty className="mt-6">
          <EmptyMedia><ListChecks className="size-5" /></EmptyMedia>
          <EmptyTitle>No confirmed documents yet.</EmptyTitle>
          <EmptyDescription>
            Upload receipts or invoices and confirm their details to build your categorized checklist.
          </EmptyDescription>
          <Link href="/dashboard/documents" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <FileText className="size-4" /> Go to documents <ArrowUpRight className="size-4" />
          </Link>
        </Empty>
      ) : (
        <ChecklistPeriods periods={orderedPeriods} />
      )}

      {confirmed.length > 0 && (
        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          Categories with no records indicate that no confirmed document is currently filed there; check your source records to determine whether anything is missing.
        </p>
      )}
    </section>
  );
}
