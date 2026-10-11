import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { WorkspaceNav } from "@/components/workspace-nav";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { claims } } = await supabase.auth.getClaims();
  if (!claims) redirect("/login");

  const email = typeof claims.email === "string" ? claims.email : "Your account";
  const initials = email.slice(0, 1).toUpperCase();

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link className="brand" href="/dashboard" aria-label="LedgerSync AI overview">
          <span className="brand-mark">LS</span><span>LedgerSync <b>AI</b></span>
        </Link>
        <div className="sidebar-label">WORKSPACE</div>
        <WorkspaceNav />
        <div className="sidebar-bottom">
          <div className="sidebar-help"><span className="help-spark">✳</span><strong>Here for the details.</strong><p>Your records stay organized, one step at a time.</p></div>
          <div className="sidebar-user">
            <span className="avatar">{initials}</span>
            <span className="user-email">{email}</span>
            <form action={signOut}><button className="signout-button" type="submit" title="Sign out" aria-label="Sign out"><LogOut size={16} /></button></form>
          </div>
        </div>
      </aside>
      <main className="workspace-main">
        <header className="workspace-topbar">
          <span className="workspace-breadcrumb">Workspace <span>/</span> Overview</span>
          <span className="workspace-secure"><span />Private workspace</span>
          <form className="mobile-signout" action={signOut}><button type="submit"><LogOut size={14} /> Sign out</button></form>
        </header>
        <div className="workspace-content">{children}</div>
      </main>
    </div>
  );
}
