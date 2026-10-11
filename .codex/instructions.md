# LedgerSync AI — Agent & System Instructions

## 1. Project Overview & Architecture

- **Project Name**: LedgerSync AI
- **Goal**: An AI-powered vertical tool to automate parsing receipts/invoices, categorizing email attachments, generating structured ledger checklists, and flagging missing accounting files.
- **Architecture Philosophy**: Minimalist, modular, type-safe, and optimized for fast "Vibe Coding" iterations.

---

## 2. Core Tech Stack Rules

- **Framework**: Next.js (App Router), React 19, TypeScript (Strict Mode).
- **UI & Styling**: Tailwind CSS, `shadcn/ui` components, `lucide-react` icons.
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Row Level Security - RLS, Supabase Storage for files).
- **AI & Schema Engine**: Vercel AI SDK (`ai`), OpenAI / Anthropic models, **Zod** for mandatory structured outputs.

## 2.1 Project Language

- All generated project artifacts must be written in English, including UI copy, documentation, identifiers, comments, error messages, and configuration text.
- The user may prompt in any language. Respond conversationally in the user's language when appropriate, but keep repository content in English.
- Do not add internationalization (i18n) or translated/localized content unless the user explicitly requests it.

---

## 3. Code Style & Architecture Guidelines

### Frontend & UI

- Use Next.js Server Components (RSC) by default; add `'use client'` only when state/interactivity is required.
- Place shared UI components in `@/components/ui` (shadcn style) and feature modules in `@/components/features/`.
- Use `shadcn/ui` and Tailwind utility classes exclusively for styling; avoid custom CSS files.

### Backend & AI Operations

- Use Next.js **Server Actions** or Route Handlers for API endpoints.
- **AI Rule**: ANY LLM output that feeds into accounting/ledger logic **MUST** be enforced via Vercel AI SDK's `generateObject` or `streamObject` using a strict **Zod Schema**. Do NOT process raw unparsed string outputs from LLMs.
- Handle file parsing asynchronously to avoid request timeouts.

### Database & Security

- Use Supabase Client with proper RLS policies (multi-tenant safety).
- Ensure file uploads (receipts/invoices in PDF/PNG/JPG) are routed directly to private Supabase Storage buckets.

---

## 4. Key Accounting Data Structures (Zod Blueprint)

When creating or modifying AI invoice/receipt parsing code, strictly reference this baseline structure:

```typescript
import { z } from "zod";

export const InvoiceParsedSchema = z.object({
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
});
```

---

## 5. Token Efficiency & Context Constraints for Agents

- Token Saver Protocol:
  - Do NOT read binary files, build output (.next), or lockfiles (pnpm-lock.yaml, package-lock.json).

  - Keep inline code comments minimal and self-explanatory through clean TypeScript interfaces.

  - When asked to fix an error, focus ONLY on the specified files. Avoid scanning the entire repository.

- Incremental Steps:
  - Output solution code step-by-step. Break long modifications into isolated modular files.
