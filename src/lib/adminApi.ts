// Client for the hosted admin UI — calls site-assets-backend's real API
// directly from the browser (no proxy). Authenticates with a Google ID
// token obtained via the "Sign in with Google" widget (see useGoogleSignIn
// in AdminPage.tsx), sent as a plain Bearer token; the backend verifies it
// itself against Google's own keys.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://site-assets-backend.jacup105.workers.dev';
const SITE_ID = import.meta.env.VITE_BACKEND_SITE_ID || 'brandon-site';

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // fetch() throws for network failures, DNS errors, and CORS
    // rejections alike — none of those are the backend's own 401/403,
    // so status 0 keeps this out of the "session expired" handling.
    throw new AdminApiError('Could not reach the backend. Check your connection and try again.', 0);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (body as { error?: string }).error || `Request failed (${res.status})`;
    throw new AdminApiError(message, res.status);
  }
  return body as T;
}

export interface RemoteEntry {
  slug: string;
  data: Record<string, unknown>;
  updatedAt: number;
}

export function listEntries(collectionId: string, token: string): Promise<RemoteEntry[]> {
  return request(`/api/sites/${SITE_ID}/collections/${collectionId}/entries`, token);
}

export function createEntry(
  collectionId: string,
  slug: string,
  data: Record<string, unknown>,
  token: string
): Promise<RemoteEntry> {
  return request(`/api/sites/${SITE_ID}/collections/${collectionId}/entries`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, data }),
  });
}

export function updateEntry(
  collectionId: string,
  slug: string,
  data: Record<string, unknown>,
  token: string
): Promise<RemoteEntry> {
  return request(`/api/sites/${SITE_ID}/collections/${collectionId}/entries/${encodeURIComponent(slug)}`, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
}

export function deleteEntry(collectionId: string, slug: string, token: string): Promise<{ ok: true }> {
  return request(`/api/sites/${SITE_ID}/collections/${collectionId}/entries/${encodeURIComponent(slug)}`, token, {
    method: 'DELETE',
  });
}

export function reorderEntries(collectionId: string, order: string[], token: string): Promise<RemoteEntry[]> {
  return request(`/api/sites/${SITE_ID}/collections/${collectionId}/entries/reorder`, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  });
}

export interface UploadedAsset {
  id: string;
  r2Key: string;
  contentType: string;
}

export async function uploadAsset(blob: Blob, filename: string, token: string): Promise<UploadedAsset> {
  const form = new FormData();
  form.append('file', blob, filename);
  return request(`/api/sites/${SITE_ID}/assets`, token, { method: 'POST', body: form });
}
