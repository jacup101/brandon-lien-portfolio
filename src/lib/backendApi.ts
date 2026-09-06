// Client for site-assets-backend's public (unauthenticated) read API —
// see /home/jacup101/workspace/site-assets-backend, src/routes/publicRead.ts.
// Configurable per Cloudflare Pages environment so beta/prod can point at
// different data without a code change:
//   VITE_BACKEND_URL       defaults to the deployed Worker
//   VITE_BACKEND_SITE_ID   defaults to 'brandon-site' — set to
//                          'brandon-site-beta' on the Preview environment.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://site-assets-backend.jacup105.workers.dev';
const SITE_ID = import.meta.env.VITE_BACKEND_SITE_ID || 'brandon-site';

export interface RemoteEntry {
  slug: string;
  data: Record<string, unknown>;
  updatedAt: number;
}

export async function fetchPublicEntries(collectionId: string): Promise<RemoteEntry[]> {
  const res = await fetch(`${BACKEND_URL}/public/sites/${SITE_ID}/collections/${collectionId}/entries`);
  if (!res.ok) {
    throw new Error(`Failed to load ${collectionId} entries (${res.status})`);
  }
  return res.json();
}

export interface RemoteDocument {
  data: Record<string, unknown>;
  updatedAt: number | null;
}

/** Same idea as fetchPublicEntries, for singleton "documents" (About). */
export async function fetchPublicDocument(documentId: string): Promise<RemoteDocument> {
  const res = await fetch(`${BACKEND_URL}/public/sites/${SITE_ID}/documents/${documentId}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${documentId} (${res.status})`);
  }
  return res.json();
}

/** Resolves an entry's stored image value (an R2 key, e.g.
 * "brandon-site/<uuid>.jpg") to a fetchable public URL. */
export function publicAssetUrl(r2Key: string): string {
  const slashIndex = r2Key.indexOf('/');
  const siteId = slashIndex === -1 ? SITE_ID : r2Key.slice(0, slashIndex);
  const filename = slashIndex === -1 ? r2Key : r2Key.slice(slashIndex + 1);
  return `${BACKEND_URL}/public/sites/${siteId}/assets/${filename}`;
}

/**
 * The inverse of publicAssetUrl — recovers the storable R2 key from a
 * resolved public URL. Needed by the inline editors: they only ever hold
 * fully-resolved display data (e.g. FilmItem, built by toFilmItem), but
 * writing an entry back to the backend means resending every field in its
 * raw stored form, including images that weren't touched by this edit.
 * A value that was never a resolved URL (already raw, or empty) passes
 * through unchanged.
 */
export function rawAssetKey(value: string): string {
  const prefix = `${BACKEND_URL}/public/sites/`;
  if (!value.startsWith(prefix)) return value;
  const match = value.slice(prefix.length).match(/^([^/]+)\/assets\/(.+)$/);
  if (!match) return value;
  const [, siteId, filename] = match;
  return siteId === SITE_ID ? filename : `${siteId}/${filename}`;
}
