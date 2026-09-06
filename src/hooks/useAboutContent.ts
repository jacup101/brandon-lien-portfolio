import { useEffect, useState } from 'react';
import { fetchPublicDocument, publicAssetUrl } from '../lib/backendApi';
import type { AboutContent, AboutStripImage } from '../data/aboutContent';
import type { SocialLink } from '../components/social/SocialLinks';

// Same caching/mapping pattern as useFilmWork/useMusicWork, for the
// singleton "about" document instead of a list of entries.
let cachedContent: Promise<AboutContent> | null = null;

function resolveImage(raw: unknown): string {
  return typeof raw === 'string' && raw ? publicAssetUrl(raw) : '';
}

// Exported for the admin editor's live preview, same reasoning as
// toFilmItem/toMusicProject.
export function toAboutContent(data: Record<string, unknown>): AboutContent {
  const bioParagraphs = Array.isArray(data.bioParagraphs) ? (data.bioParagraphs as string[]) : [];
  const stripImages = Array.isArray(data.stripImages) ? (data.stripImages as { path?: string; cropTop?: boolean }[]) : [];
  const socialLinks = Array.isArray(data.socialLinks) ? (data.socialLinks as SocialLink[]) : [];

  return {
    bioParagraphs,
    portraitImage: resolveImage(data.portraitImage),
    stripImages: stripImages
      .map((s): AboutStripImage => ({ path: resolveImage(s.path), cropTop: Boolean(s.cropTop) }))
      .filter((s) => s.path),
    socialLinks,
  };
}

async function loadAboutContent(): Promise<AboutContent> {
  const doc = await fetchPublicDocument('about');
  return toAboutContent(doc.data);
}

export function useAboutContent(): { content: AboutContent | null; error: boolean } {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!cachedContent) cachedContent = loadAboutContent();

    cachedContent
      .then((data) => {
        if (!cancelled) setContent(data);
      })
      .catch(() => {
        if (cancelled) return;
        cachedContent = null;
        setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { content, error };
}
