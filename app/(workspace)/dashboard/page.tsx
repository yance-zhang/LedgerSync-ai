import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText, FolderPlus, Sparkles } from "lucide-react";
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

const stats = [
  {
    label: "Documents collected",
    value: "0",
    note: "Your records will gather here",
    icon: FileText,
  },
  {
    label: "Ready for review",
    value: "—",
    note: "Nothing needs your attention",
    icon: Sparkles,
  },
  {
    label: "Monthly checklist",
    value: "Not started",
    note: "Your checklist comes together here",
    icon: FolderPlus,
  },
];

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Edmonton",
  })
    .format(new Date())
    .toUpperCase();

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
            <CardTitle className="max-w-xs pt-1 text-2xl">Start with what you have.</CardTitle>
            <CardDescription className="max-w-sm leading-6">
              Upload a recent receipt or invoice to get your paper trail started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/documents"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Go to documents
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
