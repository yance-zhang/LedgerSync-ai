import { z } from "zod";

export const InvoiceParsedSchema = z
  .object({
    vendorName: z.string().describe("Supplier or business name"),
    invoiceDate: z.string().describe("ISO date string YYYY-MM-DD"),
    totalAmount: z.number().describe("Final total amount including taxes"),
    currency: z.string().default("CAD"),
    taxAmount: z.number().optional().describe("GST/HST/PST tax total"),
    category: z.enum([
      "Office Supplies",
      "Software & Cloud",
      "Travel & Transport",
      "Meals & Entertainment",
      "Professional Services",
      "Utilities & Rent",
      "Other Expense",
    ]),
    lineItems: z
      .array(
        z.object({
          description: z.string(),
          amount: z.number(),
        }),
      )
      .optional(),
  })
  .strict();

export type InvoiceParsed = z.infer<typeof InvoiceParsedSchema>;
