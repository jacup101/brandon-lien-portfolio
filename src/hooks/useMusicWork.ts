import { useEffect, useState } from 'react';
import { fetchPublicEntries, publicAssetUrl } from '../lib/backendApi';
import type { FlatMusicProject, MusicLink } from '../data/musicProjects';

// Same pattern as useFilmWork.ts — see that file for the fuller
// explanation of the caching and mapping approach.
let cachedProjects: Promise<FlatMusicProject[]> | null = null;

function resolveImage(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw ? publicAssetUrl(raw) : undefined;
}

function resolveImageArray(raw: unknown): string[] {
  return Array.isArray(raw) ? (raw as string[]).map((v) => resolveImage(v)).filter((v): v is string => Boolean(v)) : [];
}

// Exported for the admin editor's live preview, same reasoning as
// useFilmWork's toFilmItem.
export function toMusicProject(entry: { slug: string; data: Record<string, unknown> }): FlatMusicProject {
  const data = entry.data;
  return {
    slug: entry.slug,
    groupId: data.groupId === 'collaborations' ? 'collaborations' : 'featured-projects',
    title: (data.title as string) ?? '',
    imgPath: resolveImage(data.imgPath),
    bannerImages: resolveImageArray(data.bannerImages),
    bannerLayout: data.bannerLayout === 'vertical' ? 'vertical' : undefined,
    carouselImages: resolveImageArray(data.carouselImages),
    role: (data.role as string) || undefined,
    description: (data.description as string) ?? '',
    year: (data.year as string) || undefined,
    links: Array.isArray(data.links) ? (data.links as MusicLink[]) : [],
    detailDescription: (data.detailDescription as string) || undefined,
    albumName: (data.albumName as string) || undefined,
    videoUrl: (data.videoUrl as string) || undefined,
    extraVideoUrls: Array.isArray(data.extraVideoUrls) ? (data.extraVideoUrls as string[]) : [],
    pdfUrl: (data.pdfUrl as string) || undefined,
    spotifyEmbedUrl: (data.spotifyEmbedUrl as string) || undefined,
    appleMusicEmbedUrl: (data.appleMusicEmbedUrl as string) || undefined,
    bandcampEmbedUrl: (data.bandcampEmbedUrl as string) || undefined,
    bandcampEmbedHeight: (data.bandcampEmbedHeight as number | null) ?? undefined,
    embedLayout: data.embedLayout === 'side-by-side' ? 'side-by-side' : undefined,
    tidalEmbedUrl: (data.tidalEmbedUrl as string) || undefined,
    soundcloudEmbedUrl: (data.soundcloudEmbedUrl as string) || undefined,
  };
}

async function loadMusicWork(): Promise<FlatMusicProject[]> {
  const entries = await fetchPublicEntries('music');
  return entries.map(toMusicProject);
}

export function useMusicWork(): { items: FlatMusicProject[] | null; error: boolean } {
  const [items, setItems] = useState<FlatMusicProject[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!cachedProjects) cachedProjects = loadMusicWork();

    cachedProjects
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (cancelled) return;
        cachedProjects = null;
        setError(true);
        setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, error };
}
