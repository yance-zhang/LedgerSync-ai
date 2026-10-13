import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedTypes = new Set(["signup", "invite", "magiclink", "recovery", "email_change"]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  const supabase = await createClient();
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.redirect(new URL("/login?error=oauth", request.url));
  }

  if (tokenHash && type && allowedTypes.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "invite" | "magiclink" | "recovery" | "email_change",
    });

    if (!error) return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.redirect(new URL("/login?confirmed=false", request.url));
}
