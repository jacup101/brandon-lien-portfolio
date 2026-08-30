import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { REPO_ROOT } from './store.ts';

// Matches the width/format of the existing hand-optimized images in this
// directory (~1000px wide progressive JPEGs).
const MAX_WIDTH = 1000;
const JPEG_QUALITY = 90;

const DIACRITIC_MARKS = /[\u0300-\u036f]/g;

export function slugify(title: string): string {
  return (
    title
      .normalize('NFKD')
      .replace(DIACRITIC_MARKS, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled'
  );
}

/**
 * Picks a free filename under `imageDir` for the given slug/extension,
 * treating `allowOverwritePath` (the entry's own current image, when
 * editing) as not a collision. `imageDir`/`publicPrefix` are absolute repo
 * path and public URL prefix respectively, e.g.
 * `public/assets/film/web` / `/assets/film/web`.
 */
export function resolveImagePath(
  imageDir: string,
  publicPrefix: string,
  slug: string,
  ext: string,
  allowOverwritePath?: string
): { absPath: string; imgPath: string } {
  const absImageDir = path.join(REPO_ROOT, imageDir);
  let attempt = 0;
  while (true) {
    const filename = attempt === 0 ? `${slug}${ext}` : `${slug}-${attempt + 1}${ext}`;
    const absPath = path.join(absImageDir, filename);
    if (!existsSync(absPath) || absPath === allowOverwritePath) {
      return { absPath, imgPath: `${publicPrefix}/${filename}` };
    }
    attempt += 1;
  }
}

export function absoluteImagePath(imageDir: string, publicImgPath: string): string {
  return path.join(REPO_ROOT, imageDir, path.basename(publicImgPath));
}

/**
 * Resizes (never up-scales) to MAX_WIDTH and re-encodes as a compressed
 * progressive JPEG, matching the existing web-optimized images in this
 * directory, then removes the original temp upload.
 */
export async function compressAndSaveImage(
  tempPath: string,
  destAbsPath: string
): Promise<void> {
  await sharp(tempPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
    .toFile(destAbsPath);
  unlinkSync(tempPath);
}
