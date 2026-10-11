import Link from "next/link";
import { ArrowUpRight, FileText, FolderPlus, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Edmonton",
  }).format(new Date()).toUpperCase();

  return (
    <>
      <section className="dashboard-welcome">
        <div>
          <p className="eyebrow">{today}</p>
          <h1>Your books, a little more in order.</h1>
          <p className="welcome-subtitle">A clear view of the documents behind your business.</p>
        </div>
        <div className="welcome-stamp"><Sparkles size={18} /><span>One step at a time</span></div>
      </section>

      <section className="dashboard-stats" aria-label="Workspace summary">
        <article className="stat-card">
          <span className="stat-icon stat-icon-green"><FileText size={19} /></span>
          <p>Documents collected</p><strong>0</strong><span className="stat-note">Your records will gather here</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-yellow"><Sparkles size={19} /></span>
          <p>Ready for review</p><strong>—</strong><span className="stat-note">Nothing needs your attention</span>
        </article>
        <article className="stat-card stat-card-accent">
          <span className="stat-icon stat-icon-blue"><FolderPlus size={19} /></span>
          <p>Monthly checklist</p><strong>Not started</strong><span className="stat-note">Your checklist comes together here</span>
        </article>
      </section>

      <section className="dashboard-lower">
        <article className="recent-card">
          <div className="section-title-row"><div><p className="eyebrow">YOUR PAPER TRAIL</p><h2>Recent documents</h2></div><Link href="/dashboard/documents">View all <ArrowUpRight size={15} /></Link></div>
          <div className="empty-documents">
            <span className="empty-file-icon"><FileText size={23} /></span>
            <h3>A good place to begin.</h3>
            <p>Once connected, your receipts and invoices will show up here, ready when you need them.</p>
            <Link href="/dashboard/documents" className="text-link">Explore documents <span>→</span></Link>
          </div>
        </article>
        <aside className="next-step-card">
          <div className="next-step-mark">✳</div>
          <p className="eyebrow">THE NEXT SMALL THING</p>
          <h2>Start with what you have.</h2>
          <p>Gather a few recent receipts or invoices. We’ll help make sense of them when document uploads are ready.</p>
          <Link href="/dashboard/documents" className="next-step-link">Go to documents <ArrowUpRight size={15} /></Link>
          <span className="next-step-decoration" aria-hidden="true">✳</span>
        </aside>
      </section>
      <footer className="workspace-footer">Made for a clearer month-end <span>·</span> LedgerSync AI</footer>
    </>
  );
}
