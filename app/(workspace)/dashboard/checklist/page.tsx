import { ListChecks } from "lucide-react";

export default function ChecklistPage() {
  return (
    <section className="simple-workspace-page">
      <p className="eyebrow">MONTH-END, MADE CLEAR</p>
      <h1>Ledger checklist</h1>
      <p className="welcome-subtitle">A practical view of what is ready and what is still missing.</p>
      <div className="simple-empty-state"><span className="empty-file-icon"><ListChecks size={23} /></span><h2>Your checklist will take shape here.</h2><p>Once your documents are in, you can review what is ready for your books.</p></div>
    </section>
  );
}
