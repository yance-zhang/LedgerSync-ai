"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

function getAuthCallbackUrl() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${siteUrl}/auth/confirm`;
}

export async function signIn(_previousState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password to continue." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Those sign-in details don’t match. Check them and try again." };
  } catch {
    return { error: "Supabase is not configured yet. Add its URL and anon key to .env.local." };
  }

  redirect("/dashboard");
}

export async function signUp(_previousState: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "Add your name and email, and use a password with at least 8 characters." };
  }

  let hasSession = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });
    if (error) return { error: "We couldn’t create your account. Check your details and try again." };
    hasSession = Boolean(data.session);
  } catch {
    return { error: "Supabase is not configured yet. Add its URL and anon key to .env.local." };
  }

  if (hasSession) redirect("/dashboard");
  return { message: "Check your email for a confirmation link to finish creating your account." };
}

export async function signInWithGoogle(
  _previousState: AuthState,
  _formData: FormData,
): Promise<AuthState> {
  void _previousState;
  void _formData;
  let url: string | undefined;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthCallbackUrl(),
        skipBrowserRedirect: true,
      },
    });
    if (error || !data.url) {
      return { error: "Social sign-in could not be started. Please try again." };
    }
    url = data.url;
  } catch {
    return { error: "Supabase is not configured yet. Add its URL and anon key to .env.local." };
  }

  redirect(url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
