import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { stageAndCommit } from './git.ts';
import { IMAGE_DIR, compressAndSaveImage, resolveImagePath, slugify } from './images.ts';
import { DATA_FILE, REPO_ROOT, loadEntries, saveEntries } from './store.ts';
import type { AdminEntry, PostProductionWorkType } from './types.ts';

const VALID_TYPES: PostProductionWorkType[] = ['Feature', 'Short', 'Vertical'];

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(REPO_ROOT, 'admin/tmp-uploads'),
    filename: (_req, file, cb) =>
      cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

function uniqueId(base: string, entries: AdminEntry[]): string {
  const ids = new Set(entries.map((entry) => entry.id));
  if (!ids.has(base)) return base;
  let n = 2;
  while (ids.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

function readFormFields(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const role = typeof body.role === 'string' ? body.role.trim() : '';
  const type = typeof body.type === 'string' ? body.type : '';
  const year = typeof body.year === 'string' ? body.year.trim() : '';
  const link = typeof body.link === 'string' ? body.link.trim() : '';
  const featured = body.featured === 'true';

  if (!title || !role || !VALID_TYPES.includes(type as PostProductionWorkType)) {
    throw new Error('Title, role, and a valid type are required.');
  }

  return { title, role, type: type as PostProductionWorkType, year, link, featured };
}

export const router = Router();

router.get('/entries', (_req, res) => {
  res.json(loadEntries());
});

router.post('/entries', upload.single('image'), async (req, res) => {
  try {
    const fields = readFormFields(req.body);
    if (!req.file) {
      throw new Error('An image is required when adding a new credit.');
    }

    const entries = loadEntries();
    const id = uniqueId(slugify(fields.title), entries);
    const slug = slugify(fields.title);
    const { absPath, imgPath } = resolveImagePath(slug, '.jpg');
    await compressAndSaveImage(req.file.path, absPath);

    const entry: AdminEntry = { id, ...fields, imgPath, updatedAt: Date.now() };
    entries.push(entry);
    saveEntries(entries);

    const git = stageAndCommit([DATA_FILE, absPath], `Add post-sound credit: ${entry.title}`);
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

    const entries = loadEntries();
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    if (order.length !== entries.length || !order.every((id) => byId.has(id))) {
      throw new Error('order must contain exactly the current entry ids, each once.');
    }

    const reordered = order.map((id) => byId.get(id) as AdminEntry);
    saveEntries(reordered);
    const git = stageAndCommit([DATA_FILE], 'Reorder post-sound credits');
    res.json({ entries: reordered, git });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/entries/:id', upload.single('image'), async (req, res) => {
  try {
    const entries = loadEntries();
    const idx = entries.findIndex((entry) => entry.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Entry not found.' });
      return;
    }

    const fields = readFormFields(req.body);
    const existing = entries[idx];
    let imgPath = existing.imgPath;
    const committedPaths = [DATA_FILE];

    if (req.file) {
      const slug = slugify(fields.title);
      const currentAbsPath = path.join(IMAGE_DIR, path.basename(existing.imgPath));
      const resolved = resolveImagePath(slug, '.jpg', currentAbsPath);
      await compressAndSaveImage(req.file.path, resolved.absPath);
      imgPath = resolved.imgPath;
      committedPaths.push(resolved.absPath);
    }

    const updated: AdminEntry = { ...existing, ...fields, imgPath, updatedAt: Date.now() };
    entries[idx] = updated;
    saveEntries(entries);

    const git = stageAndCommit(committedPaths, `Edit post-sound credit: ${updated.title}`);
    res.json({ entry: updated, git });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/entries/:id', (req, res) => {
  const entries = loadEntries();
  const idx = entries.findIndex((entry) => entry.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Entry not found.' });
    return;
  }

  const [removed] = entries.splice(idx, 1);
  saveEntries(entries);
  const git = stageAndCommit([DATA_FILE], `Remove post-sound credit: ${removed.title}`);
  res.json({ git });
});
