import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import { Brand } from "@/components/brand";
import { Alert } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; error?: string }>;
}) {
  const { confirmed, error } = await searchParams;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) redirect("/dashboard");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
  }

  return (
    <main className="min-h-screen bg-card lg:grid lg:grid-cols-[minmax(360px,0.9fr)_1.1fr]">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-forest px-10 py-9 text-primary-foreground lg:flex xl:px-16">
        <Brand className="relative z-10" tone="inverse" />

        <div className="relative z-10 max-w-lg py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest-light">
            A clearer close starts here
          </p>
          <h1 className="mt-5 text-5xl font-medium leading-[1.08] tracking-tight xl:text-6xl">
            Good records make room for better decisions.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/75">
            Bring receipts and invoices together, then move through each month with a little more
            clarity.
          </p>

          <div className="mt-10 flex flex-col gap-3 text-sm text-primary-foreground/85">
            <span className="flex items-center gap-2">
              <Check className="size-4 text-forest-light" />
              One place for your business documents
            </span>
            <span className="flex items-center gap-2">
              <Check className="size-4 text-forest-light" />
              A clearer view of your monthly records
            </span>
          </div>
        </div>

        <p className="relative z-10 flex items-center gap-2 text-xs text-primary-foreground/70">
          <ShieldCheck className="size-4" />
          Private workspace for the details behind your numbers.
        </p>
        <span
          aria-hidden="true"
          className="absolute -right-40 top-1/4 size-[36rem] rounded-full border border-white/10"
        />
        <span
          aria-hidden="true"
          className="absolute -right-24 top-1/3 size-[26rem] rounded-full border border-white/10"
        />
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:items-center lg:justify-center lg:px-14">
        <div className="mb-16 lg:hidden">
          <Brand />
        </div>

        <div className="mx-auto w-full max-w-md">
          {confirmed === "false" && (
            <Alert variant="destructive" className="mb-5">
              That confirmation link is invalid or has expired. Please try again.
            </Alert>
          )}
          {error === "oauth" && (
            <Alert variant="destructive" className="mb-5">
              Social sign-in was cancelled or could not be completed. Please try again.
            </Alert>
          )}
          <AuthForm />
          <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
            By continuing, you agree to keep your financial workspace secure and private.
          </p>
        </div>

        <Link
          href="/"
          className="mt-auto inline-flex items-center gap-2 pt-12 text-sm text-muted-foreground hover:text-foreground lg:absolute lg:bottom-8 lg:left-10"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </section>
    </main>
  );
}
