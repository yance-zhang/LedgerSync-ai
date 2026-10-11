import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <section className="simple-workspace-page">
      <p className="eyebrow">YOUR PAPER TRAIL</p>
      <h1>Documents</h1>
      <p className="welcome-subtitle">Receipts and invoices, organized in one place.</p>
      <div className="simple-empty-state"><span className="empty-file-icon"><FileText size={23} /></span><h2>Your document space is ready.</h2><p>Document uploads will be available in the next step.</p></div>
    </section>
  );
}
