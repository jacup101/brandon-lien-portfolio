# Brandon Lien Portfolio

Personal portfolio site for Brandon Lien, built with React, TypeScript, Vite, and Cloudflare Pages.

The site currently centers on three public sections:

- `/`: landing page with the reel hero
- `/post-sound`: post-production sound page with gallery work and reel
- `/about`: artist bio, links, and contact form

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

## Project Structure

- `src/App.tsx`: app shell and route definitions
- `src/pages/LandingPage.tsx`: homepage reel/intro
- `src/pages/FilmsPage.tsx`: post-sound page
- `src/pages/AboutPage.tsx`: bio, external links, and contact form
- `src/components/postProduction/PostProductionGallery.tsx`: post-sound gallery cards
- `src/data/postProductionWork.ts`: post-sound project data
- `functions/api/contact.ts`: Cloudflare Pages Function for the contact form
- `public/assets/`: site images, videos, and fonts

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

Set these in `.env.local`:

- `VITE_TURNSTILE_SITE_KEY`: public Cloudflare Turnstile site key
- `VITE_BYPASS_TURNSTILE`: optional local-only flag for bypassing the widget during development

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

If you only need to work on layout or styling, the plain Vite dev server is usually enough. If you need to test the contact form, Turnstile, or the Pages Function, use the Pages dev workflow.
