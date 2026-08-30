import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { COLLECTIONS, getCollection } from './collections.ts';
import type { CollectionConfig, FieldSchema } from './collections.ts';
import { stageAndCommit } from './git.ts';
import { absoluteImagePath, compressAndSaveImage, resolveImagePath, slugify } from './images.ts';
import { createRemoteCollectionRouter } from './remoteRoutes.ts';
import { REPO_ROOT, loadJson, saveJson } from './store.ts';

// Collections listed here (comma-separated) are served from
// site-assets-backend instead of the local JSON file + git commit — e.g.
// REMOTE_COLLECTIONS=post-sound. Empty/unset means everything stays local,
// which is the safe default until a collection's remote wiring is verified.
const REMOTE_COLLECTIONS = new Set(
  (process.env.REMOTE_COLLECTIONS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
);

type Entry = Record<string, unknown>;

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(REPO_ROOT, 'admin/tmp-uploads'),
    filename: (_req, file, cb) =>
      cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

function uniqueId(base: string, entries: Entry[], idField: string): string {
  const ids = new Set(entries.map((entry) => entry[idField]));
  if (!ids.has(base)) return base;
  let n = 2;
  while (ids.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function defaultForField(field: FieldSchema): unknown {
  if (field.type === 'array') return [];
  if (field.type === 'checkbox') return false;
  if (field.type === 'number') return null;
  return '';
}

/** Validates + shapes a raw parsed `data` JSON object against a collection's field schema. */
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
  if (typeof raw !== 'string') {
    throw new Error('Missing entry data.');
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Entry data is not valid JSON.');
  }
}

function createCollectionRouter(config: CollectionConfig): Router {
  const router = Router();

  router.get('/entries', (_req, res) => {
    res.json(loadJson<Entry[]>(config.dataFile));
  });

  router.post('/entries', upload.single('image'), async (req, res) => {
    try {
      const fields = shapeEntry(config, parseDataField(req.body));
      const entries = loadJson<Entry[]>(config.dataFile);

      const idSource =
        config.idField === 'id'
          ? String(fields[config.titleField] ?? '')
          : String(fields[config.idField] ?? '');
      if (!idSource.trim()) {
        throw new Error(`${config.idField === 'id' ? config.titleField : config.idField} is required.`);
      }
      const id = uniqueId(slugify(idSource), entries, config.idField);

      const committedPaths = [config.dataFile];

      if (config.primaryImage) {
        if (config.primaryImage.requiredOnAdd && !req.file) {
          throw new Error(`${config.primaryImage.label} is required.`);
        }
        if (req.file) {
          const slug = slugify(idSource);
          const { absPath, imgPath } = resolveImagePath(config.imageDir, config.imagePathPrefix, slug, '.jpg');
          await compressAndSaveImage(req.file.path, absPath);
          fields[config.primaryImage.key] = imgPath;
          committedPaths.push(absPath);
        } else {
          fields[config.primaryImage.key] = fields[config.primaryImage.key] ?? '';
        }
      }

      const entry: Entry = { [config.idField]: id, ...fields, updatedAt: Date.now() };
      entries.push(entry);
      saveJson(config.dataFile, entries);

      const title = String(entry[config.titleField] ?? id);
      const git = stageAndCommit(committedPaths, `Add ${config.label} entry: ${title}`);
      res.status(201).json({ entry, git });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.put('/entries/reorder', (req, res) => {
    try {
      const order: unknown = req.body.order;
      if (!Array.isArray(order) || !order.every((id) => typeof id === 'string')) {
        throw new Error('order must be an array of entry ids.');
      }

      const entries = loadJson<Entry[]>(config.dataFile);
      const byId = new Map(entries.map((entry) => [String(entry[config.idField]), entry]));
      if (order.length !== entries.length || !order.every((id) => byId.has(id))) {
        throw new Error('order must contain exactly the current entry ids, each once.');
      }

      const reordered = order.map((id) => byId.get(id) as Entry);
      saveJson(config.dataFile, reordered);
      const git = stageAndCommit([config.dataFile], `Reorder ${config.label} entries`);
      res.json({ entries: reordered, git });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.put('/entries/:entryId', upload.single('image'), async (req, res) => {
    try {
      const entries = loadJson<Entry[]>(config.dataFile);
      const idx = entries.findIndex((entry) => String(entry[config.idField]) === req.params.entryId);
      if (idx === -1) {
        res.status(404).json({ error: 'Entry not found.' });
        return;
      }

      const fields = shapeEntry(config, parseDataField(req.body));
      const existing = entries[idx];
      const committedPaths = [config.dataFile];

      if (config.primaryImage) {
        const existingImgPath = String(existing[config.primaryImage.key] ?? '');
        if (req.file) {
          const idSource =
            config.idField === 'id'
              ? String(fields[config.titleField] ?? '')
              : String(fields[config.idField] ?? existing[config.idField]);
          const slug = slugify(idSource);
          const currentAbsPath = existingImgPath
            ? absoluteImagePath(config.imageDir, existingImgPath)
            : undefined;
          const resolved = resolveImagePath(config.imageDir, config.imagePathPrefix, slug, '.jpg', currentAbsPath);
          await compressAndSaveImage(req.file.path, resolved.absPath);
          fields[config.primaryImage.key] = resolved.imgPath;
          committedPaths.push(resolved.absPath);
        } else {
          fields[config.primaryImage.key] = existingImgPath;
        }
      }

      const updated: Entry = { ...existing, ...fields, updatedAt: Date.now() };
      entries[idx] = updated;
      saveJson(config.dataFile, entries);

      const title = String(updated[config.titleField] ?? req.params.entryId);
      const git = stageAndCommit(committedPaths, `Edit ${config.label} entry: ${title}`);
      res.json({ entry: updated, git });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.delete('/entries/:entryId', (req, res) => {
    const entries = loadJson<Entry[]>(config.dataFile);
    const idx = entries.findIndex((entry) => String(entry[config.idField]) === req.params.entryId);
    if (idx === -1) {
      res.status(404).json({ error: 'Entry not found.' });
      return;
    }

    const [removed] = entries.splice(idx, 1);
    saveJson(config.dataFile, entries);
    const title = String(removed[config.titleField] ?? req.params.entryId);
    const git = stageAndCommit([config.dataFile], `Remove ${config.label} entry: ${title}`);
    res.json({ git });
  });

  return router;
}

export const router = Router();

router.get('/collections', (_req, res) => {
  res.json(COLLECTIONS);
});

for (const config of COLLECTIONS) {
  const collectionRouter = REMOTE_COLLECTIONS.has(config.id)
    ? createRemoteCollectionRouter(config)
    : createCollectionRouter(config);
  router.use(`/collections/${config.id}`, collectionRouter);
}

router.use((req, res, next) => {
  const match = req.path.match(/^\/collections\/([^/]+)/);
  if (match && !getCollection(match[1])) {
    res.status(404).json({ error: `Unknown collection: ${match[1]}` });
    return;
  }
  next();
});
