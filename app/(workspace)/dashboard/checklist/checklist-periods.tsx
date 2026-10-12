"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvoiceParsed } from "@/lib/schemas/invoice";

type ChecklistEntry = {
  document: { id: string; file_name: string };
  invoice: InvoiceParsed;
};

type ChecklistPeriod = {
  key: string;
  label: string;
  entries: ChecklistEntry[];
};

const categories = [
  "Office Supplies",
  "Software & Cloud",
  "Travel & Transport",
  "Meals & Entertainment",
  "Professional Services",
  "Utilities & Rent",
  "Other Expense",
] as const;

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function ChecklistPeriods({ periods }: { periods: ChecklistPeriod[] }) {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const visiblePeriods = selectedMonths.length
    ? periods.filter((period) => selectedMonths.includes(period.key))
    : periods;
  const visibleCount = visiblePeriods.reduce((count, period) => count + period.entries.length, 0);

  function toggleMonth(month: string) {
    setSelectedMonths((current) =>
      current.includes(month) ? current.filter((item) => item !== month) : [...current, month],
    );
  }

  return (
    <>
      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Filter by month</p>
            <p className="mt-1 text-xs text-muted-foreground">Select one or more months, or show all recorded months.</p>
          </div>
          <Badge variant="outline" className="bg-background">
            {selectedMonths.length ? `${visibleCount} documents shown` : "All months"}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Filter checklist by month">
          <button
            type="button"
            aria-pressed={selectedMonths.length === 0}
            onClick={() => setSelectedMonths([])}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedMonths.length === 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            All months
          </button>
          {periods.map((period) => {
            const selected = selectedMonths.includes(period.key);
            return (
              <button
                key={period.key}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleMonth(period.key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {period.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {visiblePeriods.map((period) => (
          <section key={period.key}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{period.label}</h3>
              <span className="text-xs text-muted-foreground">{period.entries.length} confirmed {period.entries.length === 1 ? "document" : "documents"}</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {categories.map((category) => {
                const entries = period.entries.filter(({ invoice }) => invoice.category === category);
                const totals = new Map<string, number>();
                entries.forEach(({ invoice }) => totals.set(invoice.currency, (totals.get(invoice.currency) ?? 0) + invoice.totalAmount));
                return (
                  <Card key={category} className="shadow-none">
                    <CardHeader className="flex-row items-start justify-between gap-3 pb-4">
                      <div>
                        <CardTitle className="text-base">{category}</CardTitle>
                        <CardDescription className="mt-1">
                          {entries.length > 0
                            ? [...totals].map(([currency, total]) => formatMoney(total, currency)).join(" · ")
                            : "No confirmed documents in this category"}
                        </CardDescription>
                      </div>
                      <Badge variant={entries.length ? "secondary" : "outline"}>
                        {entries.length ? `${entries.length} ${entries.length === 1 ? "item" : "items"}` : "No records"}
                      </Badge>
                    </CardHeader>
                    {entries.length > 0 && (
                      <CardContent className="space-y-2">
                        {entries.map(({ document, invoice }) => (
                          <Link
                            key={document.id}
                            href={`/dashboard/documents/${document.id}`}
                            className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{invoice.vendorName}</span>
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{document.file_name} · {invoice.invoiceDate}</span>
                            </span>
                            <span className="shrink-0 text-sm font-medium">{formatMoney(invoice.totalAmount, invoice.currency)}</span>
                            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
                          </Link>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
        {visiblePeriods.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Select a month to view its checklist.
          </p>
        )}
      </div>
    </>
  );
}
