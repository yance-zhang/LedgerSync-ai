"use client";

import { useActionState, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import {
  signIn,
  signInWithGoogle,
  signUp,
  type AuthState,
} from "@/app/auth/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: AuthState = {};
type Mode = "signin" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [googleState, googleAction, googlePending] = useActionState(signInWithGoogle, initialState);
  const busy = pending || googlePending;

  return (
    <Card className="border-border/80 shadow-lg shadow-foreground/5">
      <CardHeader className="gap-2 p-7 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Your workspace awaits
        </p>
        <CardTitle className="pt-2 text-3xl tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {mode === "signin"
            ? "Sign in to pick up where you left off."
            : "Start bringing your business documents together."}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-7 pb-7 sm:px-8 sm:pb-8">
        {state.message ? (
          <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
            <p className="font-semibold">Almost there</p>
            <p className="mt-1 leading-6">{state.message}</p>
          </Alert>
        ) : (
          <>
            <form action={googleAction}>
              <Button type="submit" variant="outline" className="h-11 w-full" disabled={busy}>
                {googlePending ? (
                  <>
                    <LoaderCircle data-icon="inline-start" className="animate-spin" />
                    Redirecting to Google…
                  </>
                ) : (
                  <>
                    <GoogleMark />
                    Continue with Google
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t border-border" />
              </div>
              <p className="relative flex justify-center text-xs text-muted-foreground">
                <span className="bg-card px-2">or continue with email</span>
              </p>
            </div>

            <form action={formAction}>
              <FieldGroup>
                {mode === "signup" && (
                  <Field>
                    <FieldLabel htmlFor="name">Your name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Alex Morgan"
                      required
                    />
                  </Field>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder="At least 8 characters"
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </Field>

                {(state.error || googleState.error) && (
                  <Alert variant="destructive" role="alert">
                    {state.error ?? googleState.error}
                  </Alert>
                )}

                <Button type="submit" className="mt-1 h-11 w-full" disabled={busy}>
                  {pending ? (
                    <>
                      <LoaderCircle data-icon="inline-start" className="animate-spin" />
                      Please wait…
                    </>
                  ) : (
                    <>
                      {mode === "signin" ? "Sign in" : "Create account"}
                      <ArrowRight data-icon="inline-end" />
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          </>
        )}

        {!state.message && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to LedgerSync?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-semibold text-primary underline-offset-4 hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.85-.07-1.67-.21-2.46H12v4.66h6.46c-.28 1.5-1.12 2.77-2.39 3.62v3.01h3.87c2.26-2.08 3.55-5.14 3.55-8.83Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3.01c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11C3.25 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.22 7.22 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}
