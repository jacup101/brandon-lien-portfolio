/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BYPASS_TURNSTILE?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface TurnstileRenderOptions {
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  action?: string;
  theme?: 'auto' | 'light' | 'dark';
}

interface TurnstileInstance {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions & { sitekey: string }) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

interface Window {
  turnstile?: TurnstileInstance;
}
