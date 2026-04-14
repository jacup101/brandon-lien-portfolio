# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## Contact Form Setup

This project uses a Cloudflare Pages Function at `functions/api/contact.ts` for the contact form.

Development commands:

- `npm run dev`: Vite-only frontend development
- `npm run dev:pages`: full local Cloudflare Pages run with the contact form function and `.dev.vars` secrets

The `dev:pages` command uses a temporary Wrangler persistence directory in `/tmp/brandon-site-wrangler-state` to avoid the local SQLite lock issue we hit with Wrangler's default `.wrangler/state` folder.

Required environment values:

- `VITE_TURNSTILE_SITE_KEY`: public Turnstile site key used by the React form
- `VITE_BYPASS_TURNSTILE`: optional local-only frontend flag to hide the widget during local testing
- `TURNSTILE_SECRET_KEY`: secret key used by the Pages Function to verify captchas
- `BYPASS_TURNSTILE`: optional local-only Pages Function flag to skip captcha verification during local testing
- `RESEND_API_KEY`: Resend API key used to send email
- `RESEND_FROM_EMAIL`: verified sender address in Resend
- `CONTACT_TO_EMAIL`: inbox that should receive portfolio messages

Local development files:

- Copy `.env.local.example` to `.env.local` for the public Turnstile site key
- Copy `.dev.vars.example` to `.dev.vars` for local Pages Function secrets

Testing locally:

- Use `npm run dev` when you are only working on layout, content, or styling
- Use `npm run dev:pages` when you need to test Turnstile, the `/api/contact` Pages Function, or Resend delivery
- The full local Pages server is available at `http://localhost:8788` when `npm run dev:pages` is running
- Set `VITE_BYPASS_TURNSTILE=true` in `.env.local` and `BYPASS_TURNSTILE=true` in `.dev.vars` to bypass captcha locally while keeping it enabled in production

Production on Cloudflare Pages:

- Add `VITE_TURNSTILE_SITE_KEY` as an environment variable in the Pages project settings
- Add the other values as secrets in the Pages project settings
