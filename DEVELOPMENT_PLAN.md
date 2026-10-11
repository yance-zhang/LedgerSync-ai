# LedgerSync AI Development Plan

## Project Goal

Build an accounting document workspace that collects receipts and invoices, extracts structured information, supports categorization and ledger checklist creation, and flags missing documents.

## Technology Decisions

- Next.js App Router, React 19, and TypeScript strict mode
- Tailwind CSS, shadcn/ui, and lucide-react
- Supabase Auth, Postgres with row-level security (RLS), and private Storage
- Vercel AI SDK structured outputs validated with Zod for accounting data

## Suggested Implementation Phases

1. **Foundation:** Initialize Next.js, TypeScript, and Tailwind; configure path aliases, an environment variable template, and the base UI.
2. **Data and access control:** Define user, organization, and document relationships; add Supabase migrations, RLS policies, and private storage rules.
3. **Authentication and app shell:** Add sign-in and a protected dashboard layout with navigation.
4. **Document management:** Support PDF and image uploads, document lists and details, and asynchronous processing status.
5. **Structured extraction and review:** Define Zod schemas, add AI-powered structured extraction, and provide a human review and correction flow.
6. **Ledger checklist and missing-document alerts:** Generate categorized checklists from confirmed documents and surface missing or exceptional items.
7. **Release readiness:** Add error and empty states, accessibility improvements, logging, and deployment configuration; review RLS and file access boundaries.

## Recommended Initial Scope

Start with authentication, private uploads, document lists, and records that users can review and confirm. Add AI extraction and automated checklists afterward to reduce early changes to the data model and security policies.
