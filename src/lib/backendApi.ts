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

/** Resolves an entry's stored image value (an R2 key, e.g.
 * "brandon-site/<uuid>.jpg") to a fetchable public URL. */
export function publicAssetUrl(r2Key: string): string {
  const slashIndex = r2Key.indexOf('/');
  const siteId = slashIndex === -1 ? SITE_ID : r2Key.slice(0, slashIndex);
  const filename = slashIndex === -1 ? r2Key : r2Key.slice(slashIndex + 1);
  return `${BACKEND_URL}/public/sites/${siteId}/assets/${filename}`;
}
