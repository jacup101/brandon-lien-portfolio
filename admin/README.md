# Post-sound admin tool

A local-only tool for managing the `/post-sound` credits gallery
(`src/data/postProductionWork.json`) without hand-editing the file or
running git commands directly.

## Running it

```
npm run admin
```

Then open one of the URLs it prints (defaults to port `4787`). Set
`ADMIN_PORT` to use a different port.

## What it does

- Add, edit, delete, and reorder post-sound credits through a web form.
- Uploaded images are automatically resized (max 1000px wide, never
  up-scaled) and re-encoded as compressed progressive JPEGs — matching the
  existing images in `public/assets/film/web/` — before being saved there.
- Every save automatically runs `git add` + `git commit` for the changed
  files, with a descriptive commit message.

## What it deliberately does NOT do

- **No authentication.** By default the server listens on all interfaces
  (`0.0.0.0`), so anyone who can reach this host on this port — e.g. any
  device on your LAN — can open the tool and edit the site. That's fine on a
  trusted home network but is NOT safe on a public/shared network, and this
  must never be exposed to the open internet (no port-forwarding it through
  your router). Set `ADMIN_HOST=127.0.0.1` to go back to localhost-only
  access. If you want to let someone outside your LAN (e.g. a friend) use
  this, add real access control first (e.g. a tunnel + password, or hosting
  it behind something like Cloudflare Access).
- **Never pushes to git.** It stages and commits locally so your history
  stays clean, but pushing to the remote is left as a deliberate, manual
  step for you to do yourself (`git push`).
- **Never deletes old image files** when you replace or remove an entry's
  image — avoids any risk of deleting something still referenced. Clean up
  orphaned files in `public/assets/film/web/` by hand occasionally if it
  bothers you.

## How it's isolated from the production site

`admin/` is not included in `tsconfig.app.json` or referenced by Vite's
build graph (which starts from `index.html`/`src`), so nothing here can ever
end up in `dist/` or the deployed site.

## Remote backend integration (in progress)

This tool is meant to eventually be replaced by
[`site-assets-backend`](../../site-assets-backend) (a separate repo — a
Cloudflare Worker + D1 + R2 backend, gated by Cloudflare Access). That
migration is happening one collection at a time rather than all at once.

Set `REMOTE_COLLECTIONS` to a comma-separated list of collection ids to
route through the remote backend instead of the local JSON file + git
commit — e.g. `REMOTE_COLLECTIONS=post-sound npm run admin`. Leave it unset
(the default) and everything stays local, exactly as described above.

Other env vars for remote mode:
- `BACKEND_URL` — defaults to the deployed Worker
  (`https://site-assets-backend.<subdomain>.workers.dev`); point it at
  `http://127.0.0.1:8787` to test against a local `wrangler dev` instance
  of that repo instead.
- `BACKEND_SITE_ID` — defaults to `brandon-site`.
- `BACKEND_ACCESS_CLIENT_ID` / `BACKEND_ACCESS_CLIENT_SECRET` — a
  Cloudflare Access **Service Token** (create one in Zero Trust → Access →
  Service Auth), needed once the deployed backend is actually gated by
  Access. Without these set, requests to the *deployed* backend will get a
  401 — which is why this hasn't been flipped on by default yet, and why
  it was only verified tonight against a local test instance of the
  backend, never the real deployed one.

What changes in remote mode: images are still compressed locally (this
tool's Node process can run `sharp`; the Worker can't), then uploaded to
the backend's `/assets` endpoint instead of saved into `public/assets/`.
Entries live in the backend's D1 database instead of this repo's JSON
files, so **remote-mode saves are not git commits** — the response's `git`
field is simply `null`. Only `post-sound` has this wired up so far;
`admin/server/remoteRoutes.ts` mirrors the same request/response shape as
the local router, so the same pattern extends to film/music/about without
any admin/public/*.js changes once it's worth doing.
