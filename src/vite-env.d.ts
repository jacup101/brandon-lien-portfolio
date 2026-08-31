/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BYPASS_TURNSTILE?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_BACKEND_SITE_ID?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
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

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
}

interface GoogleAccountsId {
  initialize: (config: GoogleIdConfig) => void;
  renderButton: (container: HTMLElement, options: GoogleButtonOptions) => void;
  disableAutoSelect: () => void;
}

interface Window {
  turnstile?: TurnstileInstance;
  google?: { accounts: { id: GoogleAccountsId } };
}
