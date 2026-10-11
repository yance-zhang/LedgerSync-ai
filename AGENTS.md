# Repository Instructions

## Core stack

- Use Next.js App Router, React 19, and TypeScript strict mode.
- Build UI with Tailwind CSS, `shadcn/ui` components, and `lucide-react` icons. Use `shadcn/ui` and Tailwind utilities exclusively for styling; avoid custom CSS files.
- Use Supabase PostgreSQL, Auth, Row Level Security (RLS), and private Supabase Storage for backend and file storage.
- Use the Vercel AI SDK (`ai`) and Zod for AI operations and structured data.

## Project artifacts and language

- Write all repository artifacts in English: UI copy, documentation, identifiers, comments, error messages, and configuration text.
- Respond conversationally in the user's language when appropriate. Do not add i18n or translated project content unless explicitly requested.

## Architecture and implementation

- Prefer Next.js Server Components. Add `'use client'` only when state or browser interaction requires it.
- Put shared UI components in `@/components/ui` using shadcn conventions, and feature modules in `@/components/features/`.
- Use Next.js Server Actions or Route Handlers for API endpoints.
- Handle file parsing asynchronously to avoid request timeouts. Route receipt and invoice uploads directly to private Supabase Storage buckets.
- Preserve multi-tenant safety with appropriate Supabase RLS policies.
- Any LLM output used by accounting or ledger logic must use Vercel AI SDK `generateObject` or `streamObject` with a strict Zod schema. Never use raw, unparsed LLM strings for that logic.
- When creating or modifying invoice/receipt parsing, follow the baseline schema in `.codex/instructions.md` (`InvoiceParsedSchema`).

## Working constraints

- Do not read binary files, build output (`.next`), or lockfiles.
- Keep inline comments minimal; prefer clear TypeScript interfaces and code.
- When fixing an error, focus on the specified files and avoid scanning the entire repository.
- Make long modifications in isolated, modular steps.
