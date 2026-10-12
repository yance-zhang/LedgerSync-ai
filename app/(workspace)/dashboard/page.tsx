import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText, FolderPlus, Sparkles } from "lucide-react";
import { InvoiceParsedSchema } from "@/lib/schemas/invoice";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/workspaces";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type DocumentRow = {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  reviewed_data: unknown;
};

const attentionStatuses = new Set(["uploaded", "processing", "needs_review", "failed"]);

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Edmonton",
  }).format(new Date(date));
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default async function DashboardPage() {
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
  const needsAttention = documents.filter((document) => attentionStatuses.has(document.status)).length;
  const confirmed = documents.filter(
    (document) =>
      document.status === "confirmed" &&
      InvoiceParsedSchema.safeParse(document.reviewed_data).success,
  );
  const monthParts = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    timeZone: "America/Edmonton",
  }).formatToParts(new Date());
  const monthKey = `${monthParts.find((part) => part.type === "year")?.value}-${monthParts.find((part) => part.type === "month")?.value}`;
  const thisMonthConfirmed = confirmed.filter((document) => {
    const parsed = InvoiceParsedSchema.safeParse(document.reviewed_data);
    return parsed.success && parsed.data.invoiceDate.startsWith(monthKey);
  }).length;

  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Edmonton",
  })
    .format(new Date())
    .toUpperCase();

  const stats = [
    {
      label: "Documents collected",
      value: String(documents.length),
      note: documents.length === 1 ? "1 document in your workspace" : `${documents.length} documents in your workspace`,
      icon: FileText,
    },
    {
      label: "Need attention",
      value: String(needsAttention),
      note: needsAttention === 0 ? "Nothing needs your attention" : "Uploads that may need your attention",
      icon: Sparkles,
    },
    {
      label: "Monthly checklist",
      value: String(thisMonthConfirmed),
      note: thisMonthConfirmed === 1 ? "Confirmed record dated this month" : "Confirmed records dated this month",
      icon: FolderPlus,
    },
  ];

  return (
    <>
      <section className="flex items-end justify-between gap-4 py-10 sm:py-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.17em] text-muted-foreground">
            {today}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Your books, a little more in order.
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A clear view of the documents behind your business.
          </p>
        </div>
        <Badge
          variant="outline"
          className="hidden gap-2 bg-card px-3 py-2 text-muted-foreground sm:flex"
        >
          <Sparkles className="size-4 text-primary" />
          One step at a time
        </Badge>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Workspace summary">
        {stats.map(({ label, value, note, icon: Icon }) => (
          <Card key={label} className="shadow-none">
            <CardHeader className="flex-row items-start justify-between pb-3">
              <div>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="mt-3 text-2xl">{value}</CardTitle>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.55fr_0.85fr]">
        <Card className="shadow-none">
          <CardHeader className="flex-row items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Your paper trail
              </p>
              <CardTitle className="mt-2">Recent documents</CardTitle>
            </div>
            <Link
              href="/dashboard/documents"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View all
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <Empty className="min-h-64 border-0 bg-muted/40">
                <EmptyMedia>
                  <FileText className="size-5" />
                </EmptyMedia>
                <EmptyTitle>A good place to begin.</EmptyTitle>
                <EmptyDescription>
                  Once uploaded, your receipts and invoices will be ready here when you need them.
                </EmptyDescription>
                <Link
                  href="/dashboard/documents"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "mt-4",
                  })}
                >
                  Explore documents
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Empty>
            ) : (
              <div className="divide-y divide-border">
                {documents.slice(0, 5).map((document) => (
                  <Link
                    key={document.id}
                    href={`/dashboard/documents/${document.id}`}
                    className="flex items-center gap-3 py-4 first:pt-1 last:pb-1"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                      <FileText className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{document.file_name}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Added {formatDate(document.created_at)}
                      </span>
                    </span>
                    <Badge variant={document.status === "confirmed" ? "secondary" : "outline"}>
                      {statusLabel(document.status)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-forest-soft shadow-none">
          <CardHeader>
            <span className="mb-3 grid size-10 place-items-center rounded-xl bg-card/70 text-primary">
              <Sparkles className="size-5" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              The next small thing
            </p>
            <CardTitle className="max-w-xs pt-1 text-2xl">
              {needsAttention > 0 ? "Check a recent upload." : "Keep your paper trail current."}
            </CardTitle>
            <CardDescription className="max-w-sm leading-6">
              {needsAttention > 0
                ? `${needsAttention} document${needsAttention === 1 ? " needs" : "s need"} your attention.`
                : "Upload a recent receipt or invoice to keep your records up to date."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={needsAttention > 0 ? "/dashboard/documents" : "/dashboard/checklist"}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              {needsAttention > 0 ? "Open documents" : "Open checklist"}
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
