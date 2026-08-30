// One-off: seeds `brandon-site-beta` with a copy of `brandon-site`'s real
// post-sound entries, reusing the same R2 image keys (no re-upload —
// image bytes are identical, and R2 keys aren't enforced as
// site-scoped, just a bookkeeping convention).
//
// Run with: tsx --env-file=admin/.env.remote admin/server/scripts/copy-post-sound-to-beta.ts
import * as backend from '../backend.ts';

const SOURCE_SITE_ID = 'brandon-site';
const TARGET_SITE_ID = 'brandon-site-beta';

async function main() {
  const sourceEntries = await backend.listEntriesForSite(SOURCE_SITE_ID, 'post-sound');
  console.log(`Copying ${sourceEntries.length} post-sound entries from ${SOURCE_SITE_ID} to ${TARGET_SITE_ID}...`);

  let ok = 0;
  let failed = 0;

  for (const entry of sourceEntries) {
    try {
      await backend.createEntryForSite(TARGET_SITE_ID, 'post-sound', entry.slug, entry.data);
      console.log(`  ✓ ${entry.slug}`);
      ok += 1;
    } catch (err) {
      console.error(`  ✗ ${entry.slug}: ${(err as Error).message}`);
      failed += 1;
    }
  }

  console.log(`Done. ${ok} copied, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
