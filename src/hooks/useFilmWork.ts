import { useEffect, useState } from 'react';
import { fetchPublicEntries, publicAssetUrl } from '../lib/backendApi';
import type { FilmItem, GalleryItem, CreditBlock } from '../data/filmWork';

// Cached at module scope so navigating from the list page to a detail page
// (or back) doesn't re-fetch — every consumer of this hook shares one
// in-flight/resolved request for the lifetime of the tab.
let cachedItems: Promise<FilmItem[]> | null = null;

function resolveImage(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw ? publicAssetUrl(raw) : undefined;
}

// Exported for the admin editor's live preview, which needs the exact same
// raw-backend-data -> FilmItem mapping fed by in-progress form values
// instead of a fetched entry.
export function toFilmItem(entry: { slug: string; data: Record<string, unknown> }): FilmItem {
  const data = entry.data;
  const laurels = Array.isArray(data.laurels) ? (data.laurels as string[]) : [];
  const credits = Array.isArray(data.credits) ? (data.credits as CreditBlock[]) : [];
  const gallery = Array.isArray(data.gallery) ? (data.gallery as GalleryItem[]) : [];

  return {
    slug: entry.slug,
    title: data.title as string,
    year: (data.year as string) || undefined,
    role: (data.role as string) ?? '',
    blurb: (data.blurb as string) ?? '',
    imgPath: resolveImage(data.imgPath),
    imgContain: data.imgContain as boolean,
    subtitleLayout: data.subtitleLayout as boolean,
    description: (data.description as string) || undefined,
    videoUrl: (data.videoUrl as string) || undefined,
    credit: (data.credit as string) || undefined,
    // Empty-vs-absent matters here: FilmDetailPage only shows the plain
    // `credit` footer line when `credits` is undefined, not just empty.
    credits: credits.length ? credits : undefined,
    laurels: laurels.length ? laurels.map((l) => resolveImage(l)!) : undefined,
    gallery: gallery.length
      ? gallery.map((g) => ({ ...g, imgPath: resolveImage(g.imgPath) }))
      : undefined,
    galleryColumns: (data.galleryColumns as number) || undefined,
    heroImg: resolveImage(data.heroImg),
    imdbUrl: (data.imdbUrl as string) || undefined,
  };
}

async function loadFilmWork(): Promise<FilmItem[]> {
  const entries = await fetchPublicEntries('film');
  return entries.map(toFilmItem);
}

export function useFilmWork(): { items: FilmItem[] | null; error: boolean } {
  const [items, setItems] = useState<FilmItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!cachedItems) cachedItems = loadFilmWork();

    cachedItems
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (cancelled) return;
        cachedItems = null; // let a retry (e.g. remount) try again
        setError(true);
        setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, error };
}
