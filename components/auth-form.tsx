"use client";

import { useActionState, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";
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

              {state.error && (
                <Alert variant="destructive" role="alert">
                  {state.error}
                </Alert>
              )}

              <Button type="submit" className="mt-1 h-11 w-full" disabled={pending}>
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
