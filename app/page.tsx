const setupItems = [
  { number: "01", title: "Connect your documents", description: "Upload receipts and invoices, and keep every file in one place." },
  { number: "02", title: "Review document status", description: "Track items that need review and identify missing files." },
  { number: "03", title: "Build your ledger checklist", description: "Prepare documents for categorization and month-end review." },
];

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <a className="flex items-center gap-3 font-semibold tracking-tight" href="/" aria-label="LedgerSync AI home">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--primary)] text-sm text-white">LS</span>
          <span>LedgerSync <span className="text-[var(--primary)]">AI</span></span>
        </a>
        <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--muted)]">Canada · CAD</span>
      </div>

      <section className="mx-auto grid max-w-6xl gap-12 pb-20 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-28">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Accounting documents, made clear</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">Every receipt,<br />right where it belongs.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">LedgerSync AI brings receipts and invoices together and helps you build an accounting checklist you can review with confidence.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#workflow" className="rounded-xl bg-[var(--primary)] px-5 py-3 font-medium text-white transition hover:opacity-90">Get started <span aria-hidden="true">→</span></a>
            <a href="#workflow" className="rounded-xl border border-[var(--line)] bg-white px-5 py-3 font-medium transition hover:bg-stone-50">See how it works</a>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[0_24px_80px_-48px_rgba(24,35,31,0.35)] sm:p-8">
          <div className="flex items-start justify-between border-b border-[var(--line)] pb-6">
            <div><p className="text-sm text-[var(--muted)]">This month</p><h2 className="mt-2 text-2xl font-semibold">Organization progress</h2></div>
            <span className="rounded-full bg-[var(--primary-soft)] px-3 py-1 text-sm font-medium text-[var(--primary)]">Ready to begin</span>
          </div>
          <div className="grid grid-cols-2 gap-4 py-6">
            <div className="rounded-2xl bg-[var(--background)] p-5"><p className="text-sm text-[var(--muted)]">Files organized</p><p className="mt-3 text-3xl font-semibold">—</p></div>
            <div className="rounded-2xl bg-[var(--background)] p-5"><p className="text-sm text-[var(--muted)]">Items to review</p><p className="mt-3 text-3xl font-semibold">—</p></div>
          </div>
          <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-5 text-center text-sm leading-6 text-[var(--muted)]">Your document progress will appear here once setup is complete.</p>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-6xl border-t border-[var(--line)] pt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">A simple three-step workflow</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {setupItems.map((item) => (
            <article key={item.number} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
              <p className="text-sm font-semibold text-[var(--primary)]">{item.number}</p>
              <h2 className="mt-5 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="mx-auto mt-16 max-w-6xl border-t border-[var(--line)] py-6 text-sm text-[var(--muted)]">LedgerSync AI <span className="px-2">·</span> Your accounting document workspace</footer>
    </main>
  );
}
