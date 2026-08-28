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
