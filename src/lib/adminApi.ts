// Client for the hosted admin UI — talks to /admin/api/* (this site's own
// Pages Function proxy, see functions/admin/api/[[path]].ts), never to
// site-assets-backend directly. Same-origin, so no CORS/cookie concerns;
// the proxy attaches the real backend credentials server-side.
const SITE_ID = import.meta.env.VITE_BACKEND_SITE_ID || 'brandon-site';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/admin/api${path}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  }
  return body as T;
}

export interface RemoteEntry {
  slug: string;
  data: Record<string, unknown>;
  updatedAt: number;
}

export function listEntries(collectionId: string): Promise<RemoteEntry[]> {
  return request(`/sites/${SITE_ID}/collections/${collectionId}/entries`);
}

export function createEntry(collectionId: string, slug: string, data: Record<string, unknown>): Promise<RemoteEntry> {
  return request(`/sites/${SITE_ID}/collections/${collectionId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, data }),
  });
}

export function updateEntry(collectionId: string, slug: string, data: Record<string, unknown>): Promise<RemoteEntry> {
  return request(`/sites/${SITE_ID}/collections/${collectionId}/entries/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
}

export function deleteEntry(collectionId: string, slug: string): Promise<{ ok: true }> {
  return request(`/sites/${SITE_ID}/collections/${collectionId}/entries/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });
}

export function reorderEntries(collectionId: string, order: string[]): Promise<RemoteEntry[]> {
  return request(`/sites/${SITE_ID}/collections/${collectionId}/entries/reorder`, {
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

export async function uploadAsset(blob: Blob, filename: string): Promise<UploadedAsset> {
  const form = new FormData();
  form.append('file', blob, filename);
  return request(`/sites/${SITE_ID}/assets`, { method: 'POST', body: form });
}
