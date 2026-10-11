import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  FolderOpen,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Gather your documents",
    description: "Upload receipts and invoices, and keep every file in one place.",
    icon: FolderOpen,
  },
  {
    number: "02",
    title: "Review what needs attention",
    description: "Track document status and spot the records that still need review.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Prepare your monthly close",
    description: "Build a clear checklist for categorization and month-end review.",
    icon: ListChecks,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Brand />
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Sign in
          <ArrowUpRight data-icon="inline-end" />
        </Link>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 sm:px-8 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-12 lg:pb-28">
        <div>
          <Badge
            variant="outline"
            className="gap-2 border-primary/20 bg-accent/60 px-3 py-1.5 text-primary"
          >
            <Sparkles className="size-3.5" />
            Accounting documents, made clear
          </Badge>
          <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Every receipt,
            <br />
            <span className="text-primary">right where it belongs.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            LedgerSync AI brings receipts and invoices together and helps you build an accounting
            checklist you can review with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              Get started
              <ArrowRight data-icon="inline-end" />
            </Link>
            <a href="#workflow" className={buttonVariants({ variant: "outline", size: "lg" })}>
              See how it works
            </a>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Private workspace for your business records
          </div>
        </div>

        <Card className="relative overflow-hidden rounded-[2rem] border-border bg-card shadow-xl shadow-foreground/5">
          <CardHeader className="flex-row items-start justify-between border-b border-border/80 p-6 sm:p-8">
            <div>
              <CardDescription>This month</CardDescription>
              <CardTitle className="mt-2 text-xl sm:text-2xl">
                Organization progress
              </CardTitle>
            </div>
            <Badge className="bg-accent text-accent-foreground">Ready to begin</Badge>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl bg-muted/70 p-4 sm:p-5">
                <FolderOpen className="size-5 text-primary" />
                <p className="mt-5 text-sm text-muted-foreground">Files organized</p>
                <p className="mt-1 text-3xl font-semibold">—</p>
              </div>
              <div className="rounded-2xl bg-muted/70 p-4 sm:p-5">
                <ListChecks className="size-5 text-primary" />
                <p className="mt-5 text-sm text-muted-foreground">Items to review</p>
                <p className="mt-1 text-3xl font-semibold">—</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 sm:p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                <Check className="size-5" />
              </span>
              <p className="text-sm leading-6 text-muted-foreground">
                Your document progress will appear here once setup is complete.
              </p>
            </div>
            <div className="pointer-events-none absolute -bottom-20 -right-16 size-56 rounded-full border-[40px] border-primary/[0.035]" />
          </CardContent>
        </Card>
      </section>

      <section id="workflow" className="border-y border-border bg-card/70">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            A simple three-step workflow
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Clarity for every close.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map(({ number, title, description, icon: Icon }) => (
              <Card key={number} className="border-border/80 shadow-none">
                <CardHeader>
                  <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-accent text-primary">
                    <Icon className="size-5" />
                  </span>
                  <p className="text-xs font-semibold tracking-[0.16em] text-primary">
                    STEP {number}
                  </p>
                  <CardTitle className="pt-1">{title}</CardTitle>
                  <CardDescription className="pt-1 leading-6">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <Brand className="origin-left scale-90" />
        <p>Your accounting document workspace</p>
      </footer>
    </main>
  );
}
