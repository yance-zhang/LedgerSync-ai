import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { confirmed } = await searchParams;
  try {
    const supabase = await createClient();
    const { data: { claims } } = await supabase.auth.getClaims();
    if (claims) redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link className="brand brand-light" href="/" aria-label="LedgerSync AI home">
          <span className="brand-mark">LS</span>
          <span>LedgerSync <b>AI</b></span>
        </Link>
        <div className="auth-story-copy">
          <p className="eyebrow">A clearer close starts here</p>
          <h1>Good records make room for better decisions.</h1>
          <p>Bring receipts and invoices together, then move through each month with a little more clarity.</p>
        </div>
        <div className="auth-proof">
          <span className="proof-dot" />
          <span>One calm place for the details behind your numbers.</span>
        </div>
        <span className="auth-orbit auth-orbit-one" aria-hidden="true" />
        <span className="auth-orbit auth-orbit-two" aria-hidden="true" />
      </section>

      <section className="auth-form-side">
        <Link href="/" className="mobile-brand brand" aria-label="LedgerSync AI home">
          <span className="brand-mark">LS</span><span>LedgerSync <b>AI</b></span>
        </Link>
        <div className="auth-form-wrap">
          {confirmed === "false" && (
            <p className="form-notice form-error" role="status">That confirmation link is invalid or has expired. Please try again.</p>
          )}
          <AuthForm />
          <p className="auth-terms">By continuing, you agree to keep your financial workspace secure and private.</p>
        </div>
        <Link href="/" className="auth-back">← Back to home</Link>
      </section>
    </main>
  );
}
