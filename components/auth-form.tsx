"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

const initialState: AuthState = {};

export function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <>
      <div className="auth-heading">
        <p className="eyebrow">Your workspace awaits</p>
        <h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
        <p>{mode === "signin" ? "Sign in to pick up where you left off." : "Start bringing your business documents together."}</p>
      </div>

      {state.message ? (
        <div className="form-notice form-success" role="status">
          <span className="notice-check">✓</span>
          <div><strong>Almost there</strong><p>{state.message}</p></div>
        </div>
      ) : (
        <form action={formAction} className="auth-form">
          {mode === "signup" && (
            <label className="field-label">
              Your name
              <input name="name" type="text" autoComplete="name" placeholder="Alex Morgan" required />
            </label>
          )}
          <label className="field-label">
            Email address
            <input name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
          </label>
          <label className="field-label">
            Password
            <input name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="At least 8 characters" minLength={8} required />
          </label>
          {state.error && <p className="form-notice form-error" role="alert">{state.error}</p>}
          <button type="submit" className="auth-submit" disabled={pending}>
            {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            {!pending && <span aria-hidden="true">→</span>}
          </button>
        </form>
      )}

      {!state.message && (
        <p className="auth-switch">
          {mode === "signin" ? "New to LedgerSync?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      )}
    </>
  );
}
