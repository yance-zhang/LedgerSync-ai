# Supabase app setup

1. Copy `.env.example` to `.env.local`, then set the project URL, publishable key, and site URL. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable is accepted if your project still uses that key name.
2. Apply `migrations/202610110001_data_access_control.sql` to the Supabase project.
3. In Supabase Auth URL configuration, set the Site URL to your app origin and add `<site-origin>/auth/confirm` to the redirect URL allowlist. This route accepts both PKCE `code` redirects and token-hash email confirmations.
4. Use Node.js 22 for local development and deployment (`.nvmrc`).

The dashboard routes require a verified Supabase session. Email/password signup and sign-in are available at `/login`; email confirmation must be enabled/configured in Supabase Auth if you want verified email accounts.
