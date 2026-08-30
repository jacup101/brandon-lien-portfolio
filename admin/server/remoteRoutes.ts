// Mirrors createCollectionRouter's exact external HTTP shape (same request/
// response contract the admin frontend already speaks), but reads/writes
// through site-assets-backend instead of the local JSON file + git commit.
// This lets a collection be switched to "remote" mode (via REMOTE_COLLECTIONS
// in admin/server/index.ts) without any admin/public/*.js changes.
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import * as backend from './backend.ts';
import type { CollectionConfig, FieldSchema } from './collections.ts';
import { compressImageToBuffer } from './images.ts';
import { REPO_ROOT } from './store.ts';

type Entry = Record<string, unknown>;

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(REPO_ROOT, 'admin/tmp-uploads'),
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

function defaultForField(field: FieldSchema): unknown {
  if (field.type === 'array') return [];
  if (field.type === 'checkbox') return false;
  if (field.type === 'number') return null;
  return '';
}

/** Same validation as routes.ts's shapeEntry — duplicated rather than
 * shared so this parallel, temporary implementation can be deleted
 * cleanly once every collection has moved to remote mode. */
function shapeEntry(config: CollectionConfig, raw: unknown): Entry {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Invalid entry data.');
  }
  const data = raw as Entry;
  const result: Entry = {};
  for (const field of config.fields) {
    const value = data[field.key];
    const isEmpty = value === undefined || value === null || value === '';
    if (field.required && isEmpty) {
      throw new Error(`${field.label} is required.`);
    }
    if (field.type === 'array' && value !== undefined && !Array.isArray(value)) {
      throw new Error(`${field.label} must be a list.`);
    }
    result[field.key] = isEmpty ? defaultForField(field) : value;
  }
  return result;
}

function parseDataField(body: Record<string, unknown>): unknown {
  const raw = body.data;
  if (typeof raw !== 'string') throw new Error('Missing entry data.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Entry data is not valid JSON.');
  }
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled'
  );
}

/** Reshapes a remote entry {slug, data, updatedAt} back into the flat
 * {id/slug, ...fields, updatedAt} shape the local frontend already expects. */
function toLocalEntry(config: CollectionConfig, remote: backend.RemoteEntry): Entry {
  return { [config.idField]: remote.slug, ...remote.data, updatedAt: remote.updatedAt };
}

export function createRemoteCollectionRouter(config: CollectionConfig): Router {
  const router = Router();

  router.get('/entries', async (_req, res) => {
    try {
      const entries = await backend.listEntries(config.id);
      res.json(entries.map((e) => toLocalEntry(config, e)));
    } catch (err) {
      res.status(502).json({ error: (err as Error).message });
    }
  });

  router.post('/entries', upload.single('image'), async (req, res) => {
    try {
      const fields = shapeEntry(config, parseDataField(req.body));

      const idSource =
        config.idField === 'id' ? String(fields[config.titleField] ?? '') : String(fields[config.idField] ?? '');
      if (!idSource.trim()) {
        throw new Error(`${config.idField === 'id' ? config.titleField : config.idField} is required.`);
      }
      const slug = config.idField === 'id' ? slugify(idSource) : idSource.trim();

      if (config.primaryImage) {
        if (config.primaryImage.requiredOnAdd && !req.file) {
          throw new Error(`${config.primaryImage.label} is required.`);
        }
        fields[config.primaryImage.key] = req.file
          ? (await backend.uploadAsset(await compressImageToBuffer(req.file.path), `${slug}.jpg`, 'image/jpeg')).r2Key
          : (fields[config.primaryImage.key] ?? '');
      }

      // 'slug' travels as its own top-level param for slug-identified
      // collections — the remote schema doesn't include it in `fields`.
      if (config.idField === 'slug') delete fields.slug;

      const remote = await backend.createEntry(config.id, slug, fields);
      res.status(201).json({ entry: toLocalEntry(config, remote), git: null });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.put('/entries/reorder', async (req, res) => {
    try {
      const order: unknown = req.body.order;
      if (!Array.isArray(order) || !order.every((id) => typeof id === 'string')) {
        throw new Error('order must be an array of entry ids.');
      }
      const remote = await backend.reorderEntries(config.id, order);
      res.json({ entries: remote.map((e) => toLocalEntry(config, e)), git: null });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.put('/entries/:entryId', upload.single('image'), async (req, res) => {
    try {
      const fields = shapeEntry(config, parseDataField(req.body));

      const entryId = String(req.params.entryId);

      if (config.primaryImage) {
        if (req.file) {
          const idSource = config.idField === 'id' ? String(fields[config.titleField] ?? entryId) : entryId;
          const filenameSlug = config.idField === 'id' ? slugify(idSource) : idSource;
          const asset = await backend.uploadAsset(await compressImageToBuffer(req.file.path), `${filenameSlug}.jpg`, 'image/jpeg');
          fields[config.primaryImage.key] = asset.r2Key;
        } else {
          // No new file — carry the current value forward instead of
          // wiping it, since there's no cheap single-entry GET yet.
          const current = await backend.listEntries(config.id);
          const existing = current.find((e) => e.slug === entryId);
          fields[config.primaryImage.key] = existing ? (existing.data[config.primaryImage.key] ?? '') : '';
        }
      }

      if (config.idField === 'slug') delete fields.slug;

      const remote = await backend.updateEntry(config.id, entryId, fields);
      res.json({ entry: toLocalEntry(config, remote), git: null });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.delete('/entries/:entryId', async (req, res) => {
    try {
      await backend.deleteEntry(config.id, String(req.params.entryId));
      res.json({ git: null });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  return router;
}
