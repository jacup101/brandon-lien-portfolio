// One-off migration: copies the real post-sound credits (and their images)
// from src/data/postProductionWork.json into site-assets-backend.
//
// Run with: tsx --env-file=admin/.env.remote admin/server/scripts/migrate-post-sound.ts
//
// Images are uploaded as-is (no re-compression) since they're already the
// production-optimized files this repo has been serving all along.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import * as backend from '../backend.ts';
import { REPO_ROOT } from '../store.ts';

interface LocalEntry {
  id: string;
  title: string;
  role: string;
  type: string;
  year: string;
  link: string;
  imgPath: string;
  featured: boolean;
}

function contentTypeFor(ext: string): string {
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return map[ext] ?? 'application/octet-stream';
}

async function main() {
  const entries: LocalEntry[] = JSON.parse(
    readFileSync(path.join(REPO_ROOT, 'src/data/postProductionWork.json'), 'utf-8')
  );

  console.log(`Migrating ${entries.length} post-sound entries to site-assets-backend...`);

  let ok = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      const imageAbsPath = path.join(REPO_ROOT, 'public', entry.imgPath.replace(/^\//, ''));
      const buffer = readFileSync(imageAbsPath);
      const filename = path.basename(entry.imgPath);
      const contentType = contentTypeFor(path.extname(filename).toLowerCase());

      const asset = await backend.uploadAsset(buffer, filename, contentType);

      await backend.createEntry('post-sound', entry.id, {
        title: entry.title,
        role: entry.role,
        type: entry.type,
        year: entry.year,
        link: entry.link,
        imgPath: asset.r2Key,
        featured: entry.featured,
      });

      console.log(`  ✓ ${entry.id}`);
      ok += 1;
    } catch (err) {
      console.error(`  ✗ ${entry.id}: ${(err as Error).message}`);
      failed += 1;
    }
  }

  console.log(`Done. ${ok} migrated, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
