# Brandon Lien Portfolio

Personal portfolio site for Brandon Lien, built with React, TypeScript, Vite, and Cloudflare Pages.

The site currently centers on four public sections:

- `/`: landing page with the reel hero
- `/post-sound`: post-production sound page with gallery work and reel
- `/about`: artist bio, links, and contact form
- `/admin`: hosted, Google-authenticated editor for `/post-sound`'s
  content (see "Admin / content editing" below)

There is also a legacy `/films` route that currently points to the same content as `/post-sound`.

## Stack

- React 18
- TypeScript
- Vite
- React Router
- React Bootstrap
- Cloudflare Pages Functions
- Cloudflare Turnstile
- Resend
- [`site-assets-backend`](../site-assets-backend) — a separate repo (Cloudflare Worker + D1 + R2) that `/post-sound` and `/admin` talk to directly from the browser

## Project Structure

- `src/App.tsx`: app shell and route definitions
- `src/pages/LandingPage.tsx`: homepage reel/intro
- `src/pages/FilmsPage.tsx`: post-sound page
- `src/pages/AboutPage.tsx`: bio, external links, and contact form
- `src/pages/AdminPage.tsx`: hosted `/post-sound` content editor (see below)
- `src/components/postProduction/PostProductionGallery.tsx`: post-sound gallery cards, fetched live from `site-assets-backend`'s public read API
- `src/lib/backendApi.ts`: public (unauthenticated) read client for the live gallery
- `src/lib/adminApi.ts`: authenticated client for `/admin`, calls `site-assets-backend` directly with a Google ID token
- `src/lib/compressImage.ts`: browser-side (Canvas API) image compression before upload — there's no server here to run `sharp`
- `src/data/postProductionWork.ts`: **no longer used by any live page** — kept as a historical artifact from before `/post-sound` moved to the live backend; `admin/` (see below) doesn't manage it either
- `functions/api/contact.ts`: Cloudflare Pages Function for the contact form
- `public/assets/`: site images, videos, and fonts

## Admin / content editing

Two separate, unrelated admin tools exist, covering different content:

- **`/admin`** (`src/pages/AdminPage.tsx`) — hosted on the live site,
  manages `/post-sound` only. Gated by a real "Sign in with Google"
  flow (Google's own client-side widget, not a proxy or a shared
  secret) — the browser calls `site-assets-backend`'s API directly,
  authenticated with the resulting ID token. Requires
  `VITE_GOOGLE_CLIENT_ID`, `VITE_BACKEND_URL`, and `VITE_BACKEND_SITE_ID`
  (see Environment Variables below). See `site-assets-backend`'s own
  README for how the backend side of this auth works.
- **`admin/`** (a local-only Express tool, `npm run admin`) — manages
  Film, Music, and About page content as local JSON files + automatic
  git commits. No auth of its own (LAN-only by default); see
  `admin/README.md`. Does **not** touch `post-sound` or the backend at
  all — that split happened when `/post-sound` moved to the live
  backend and `/admin` took over editing it.

## Development

Install dependencies:

```bash
npm install
```

Run the frontend only:

```bash
npm run dev
```

Run a production build:

```bash
npm run build
```

Run the site locally with Cloudflare Pages Functions enabled:

```bash
npm run dev:pages
```

The Pages dev server runs against the built frontend and uses a temporary Wrangler persistence directory at `/tmp/brandon-site-wrangler-state`.

## Environment Variables

### Frontend

Set these in `.env.local` (copy `.env.local.example`):

- `VITE_TURNSTILE_SITE_KEY`: public Cloudflare Turnstile site key
- `VITE_BYPASS_TURNSTILE`: optional local-only flag for bypassing the widget during development
- `VITE_BACKEND_URL`: `site-assets-backend`'s deployed URL. Has a working
  default (the real deployed Worker), so only needed to override — e.g.
  pointing at a local `wrangler dev` instance of that repo.
- `VITE_BACKEND_SITE_ID`: which site's data to read/edit — `brandon-site`
  (prod, the default) or `brandon-site-beta` (a separate, identically-
  seeded copy for testing changes safely). Set this differently per
  Cloudflare Pages environment (Production → `brandon-site`, Preview →
  `brandon-site-beta`) so a beta deploy never touches real prod content.
- `VITE_GOOGLE_CLIENT_ID`: the Google OAuth Client ID `/admin`'s "Sign in
  with Google" button uses. Not sensitive — it's meant to be public,
  embedded in client-side code by design. Must match the Client ID
  `site-assets-backend` is configured to accept, and that Client ID's
  Authorized JavaScript origins must include whatever origin `/admin` is
  actually loaded from (`https://brandonlien.com`, `http://localhost:5173`, etc.).

### Local Pages Function Secrets

Set these in `.dev.vars` for local `npm run dev:pages` testing:

- `TURNSTILE_SECRET_KEY`: secret key used to verify captcha submissions
- `BYPASS_TURNSTILE`: optional local-only flag to skip captcha verification
- `RESEND_API_KEY`: Resend API key
- `RESEND_FROM_EMAIL`: verified sender address in Resend
- `CONTACT_TO_EMAIL`: inbox that receives portfolio messages

## Contact Form

The About page posts to `/api/contact`, which is handled by `functions/api/contact.ts`.

Current behavior:

- validates name, email, subject, and message
- verifies Turnstile unless bypass is enabled
- sends the message through Resend
- returns a user-facing error when configuration is missing or email delivery fails

For full local end-to-end contact form testing, use `npm run dev:pages` instead of plain `npm run dev`.

## Deployment

The site is intended for Cloudflare Pages.

Production setup needs:

- `VITE_TURNSTILE_SITE_KEY` as a Pages environment variable
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CONTACT_TO_EMAIL`
- `VITE_BACKEND_SITE_ID` — `brandon-site` on the Production environment,
  `brandon-site-beta` on Preview (see above)
- `VITE_GOOGLE_CLIENT_ID` — same value on both environments

If you only need to work on layout or styling, the plain Vite dev server is usually enough. If you need to test the contact form, Turnstile, or the Pages Function, use the Pages dev workflow.

Prod auto-deploy on push can be toggled off in the Cloudflare Pages
project settings — useful for pushing changes that should land on the
beta preview first without immediately going live on `brandonlien.com`.
