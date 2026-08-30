// Client for the site-assets-backend API (../../../site-assets-backend),
// the Cloudflare-hosted replacement for this local tool's file-based
// storage. Configured via env vars so nothing here is hardcoded:
//
//   BACKEND_URL                   e.g. https://site-assets-backend.jacup105.workers.dev
//   BACKEND_SITE_ID               defaults to 'brandon-site'
//   BACKEND_ACCESS_CLIENT_ID      Cloudflare Access Service Token (once created)
//   BACKEND_ACCESS_CLIENT_SECRET  — pairs with the client id above
//
// The Service Token headers are how a non-interactive tool like this one
// authenticates against an Access-protected app without a browser login —
// Access's documented pattern for service-to-service calls. Until a
// Service Token exists, these are simply omitted and requests will get a
// 401 from the deployed backend (which is the correct, safe default).

const BACKEND_URL = process.env.BACKEND_URL || 'https://site-assets-backend.jacup105.workers.dev';
const SITE_ID = process.env.BACKEND_SITE_ID || 'brandon-site';

function authHeaders(): Record<string, string> {
  const clientId = process.env.BACKEND_ACCESS_CLIENT_ID;
  const clientSecret = process.env.BACKEND_ACCESS_CLIENT_SECRET;
  if (clientId && clientSecret) {
    return { 'CF-Access-Client-Id': clientId, 'CF-Access-Client-Secret': clientSecret };
  }
  return {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (body as { error?: string }).error || `Backend request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export interface RemoteEntry {
  slug: string;
  data: Record<string, unknown>;
  updatedAt: number;
}

export function listEntries(collectionId: string): Promise<RemoteEntry[]> {
  return listEntriesForSite(SITE_ID, collectionId);
}

export function listEntriesForSite(siteId: string, collectionId: string): Promise<RemoteEntry[]> {
  return request(`/api/sites/${siteId}/collections/${collectionId}/entries`);
}

export function createEntry(collectionId: string, slug: string, data: Record<string, unknown>): Promise<RemoteEntry> {
  return createEntryForSite(SITE_ID, collectionId, slug, data);
}

export function createEntryForSite(
  siteId: string,
  collectionId: string,
  slug: string,
  data: Record<string, unknown>
): Promise<RemoteEntry> {
  return request(`/api/sites/${siteId}/collections/${collectionId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, data }),
  });
}

export function updateEntry(collectionId: string, slug: string, data: Record<string, unknown>): Promise<RemoteEntry> {
  return request(`/api/sites/${SITE_ID}/collections/${collectionId}/entries/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
}

export function deleteEntry(collectionId: string, slug: string): Promise<{ ok: true }> {
  return request(`/api/sites/${SITE_ID}/collections/${collectionId}/entries/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
}

export function reorderEntries(collectionId: string, order: string[]): Promise<RemoteEntry[]> {
  return request(`/api/sites/${SITE_ID}/collections/${collectionId}/entries/reorder`, {
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

export async function uploadAsset(buffer: Buffer, filename: string, contentType: string): Promise<UploadedAsset> {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: contentType }), filename);
  return request(`/api/sites/${SITE_ID}/assets`, {
    method: 'POST',
    body: form,
  });
}

/**
 * Fetches an uploaded image's raw bytes for proxying to the browser.
 * `r2Key` is the value stored in an entry's image field, e.g.
 * "brandon-site/<uuid>.jpg" — the site id prefix is parsed back out so
 * this works regardless of which site the key belongs to.
 */
export async function fetchAsset(r2Key: string): Promise<Response> {
  const slashIndex = r2Key.indexOf('/');
  const siteId = slashIndex === -1 ? SITE_ID : r2Key.slice(0, slashIndex);
  const filename = slashIndex === -1 ? r2Key : r2Key.slice(slashIndex + 1);
  return fetch(`${BACKEND_URL}/api/sites/${siteId}/assets/${filename}`, {
    headers: authHeaders(),
  });
}
