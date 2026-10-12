"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InvoiceParsedSchema, type InvoiceParsed } from "@/lib/schemas/invoice";
import { saveDocumentReview } from "./actions";

const categories = [
  "Office Supplies",
  "Software & Cloud",
  "Travel & Transport",
  "Meals & Entertainment",
  "Professional Services",
  "Utilities & Rent",
  "Other Expense",
] as const;

const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function InvoiceReviewForm({
  documentId,
  initialData,
}: {
  documentId: string;
  initialData: InvoiceParsed;
}) {
  const router = useRouter();
  const [data, setData] = useState<InvoiceParsed>(initialData);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function update<K extends keyof InvoiceParsed>(key: K, value: InvoiceParsed[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const parsed = InvoiceParsedSchema.safeParse({
      vendorName: formData.get("vendorName"),
      invoiceDate: formData.get("invoiceDate"),
      totalAmount: Number(formData.get("totalAmount")),
      currency: formData.get("currency"),
      taxAmount:
        formData.get("taxAmount") === "" ? undefined : Number(formData.get("taxAmount")),
      category: formData.get("category"),
      lineItems: data.lineItems,
    });

    if (!parsed.success || !Number.isFinite(parsed.data?.totalAmount)) {
      setMessage("Enter a valid total amount before confirming.");
      return;
    }

    startTransition(async () => {
      const result = await saveDocumentReview(documentId, parsed.data);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Review saved and document confirmed.");
      router.refresh();
    });
  }

  return (
    <Card className="mt-5 shadow-none">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Human review
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Check extracted details</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Correct any fields that do not match the document, then confirm the details.
          </p>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Vendor name
              <Input
                name="vendorName"
                required
                value={data.vendorName}
                onChange={(event) => update("vendorName", event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Invoice date
              <Input
                name="invoiceDate"
                type="date"
                value={data.invoiceDate}
                onChange={(event) => update("invoiceDate", event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Total including tax
              <Input
                name="totalAmount"
                type="number"
                min="0"
                step="0.01"
                required
                value={data.totalAmount}
                onChange={(event) => update("totalAmount", Number(event.target.value))}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Currency
              <Input
                name="currency"
                maxLength={3}
                required
                value={data.currency}
                onChange={(event) => update("currency", event.target.value.toUpperCase())}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Tax amount
              <Input
                name="taxAmount"
                type="number"
                min="0"
                step="0.01"
                value={data.taxAmount ?? ""}
                onChange={(event) =>
                  update("taxAmount", event.target.value === "" ? undefined : Number(event.target.value))
                }
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Expense category
              <select
                className={inputClass}
                name="category"
                value={data.category}
                onChange={(event) =>
                  update("category", event.target.value as InvoiceParsed["category"])
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Line items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  update("lineItems", [...(data.lineItems ?? []), { description: "", amount: 0 }])
                }
              >
                <Plus />
                Add item
              </Button>
            </div>
            {data.lineItems?.map((item, index) => (
              <div className="grid gap-2 sm:grid-cols-[1fr_10rem_auto]" key={index}>
                <Input
                  aria-label={`Line item ${index + 1} description`}
                  placeholder="Description"
                  value={item.description}
                  onChange={(event) => {
                    const lineItems = [...(data.lineItems ?? [])];
                    lineItems[index] = { ...item, description: event.target.value };
                    update("lineItems", lineItems);
                  }}
                />
                <Input
                  aria-label={`Line item ${index + 1} amount`}
                  type="number"
                  placeholder="Amount (negative for discounts)"
                  step="0.01"
                  value={item.amount}
                  onChange={(event) => {
                    const lineItems = [...(data.lineItems ?? [])];
                    lineItems[index] = { ...item, amount: Number(event.target.value) };
                    update("lineItems", lineItems);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove line item ${index + 1}`}
                  onClick={() =>
                    update(
                      "lineItems",
                      (data.lineItems ?? []).filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>

          {message && (
            <Alert className={message.startsWith("Review saved") ? "border-emerald-200 bg-emerald-50 text-emerald-900" : ""}>
              {message}
            </Alert>
          )}
          <Button type="submit" disabled={pending}>
            <Save />
            {pending ? "Saving review" : "Save corrections and confirm"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
