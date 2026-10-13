# Supabase app setup

1. Copy `.env.example` to `.env.local`, then set the project URL, publishable key, and site URL. The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable is accepted if your project still uses that key name.
2. Apply `migrations/202610110001_data_access_control.sql` to the Supabase project.
3. In Supabase Auth URL configuration, set the Site URL to your app origin and add `<site-origin>/auth/confirm` to the redirect URL allowlist. This route accepts both PKCE `code` redirects and token-hash email confirmations.
4. Use Node.js 22 for local development and deployment (`.nvmrc`).

The dashboard routes require a verified Supabase session. Email/password signup and sign-in are available at `/login`; email confirmation must be enabled/configured in Supabase Auth if you want verified email accounts.

## Google sign-in

Google sign-in is initiated by Supabase Auth from the server action in `app/auth/actions.ts`. To enable it:

1. Create a web OAuth client in Google Cloud Console and configure its consent screen.
2. In Supabase Dashboard, open Authentication > Sign In / Providers, enable Google, and save its client ID and client secret there. Do not add provider secrets to the Next.js environment or commit them.
3. Set Google's authorized redirect URI to the callback URL displayed in the Supabase Google provider settings (usually `https://<project-ref>.supabase.co/auth/v1/callback`).
4. In Supabase Authentication URL Configuration, allow `<site-origin>/auth/confirm`. Set `NEXT_PUBLIC_SITE_URL` to the deployed site origin; locally it defaults to `http://localhost:3000`.

The `/auth/confirm` route exchanges the OAuth PKCE code for a session and sends the user to `/dashboard`. Provider credentials and redirect allowlists must also be configured for each deployed environment.
