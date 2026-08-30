import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import type { FieldSchema } from './collections.ts';
import { stageAndCommit } from './git.ts';
import { absoluteImagePath, compressAndSaveImage, resolveImagePath } from './images.ts';
import { REPO_ROOT, loadJson, saveJson } from './store.ts';

export interface AboutSocialLink {
  href: string;
  ariaLabel: string;
  iconClass: string;
}

export interface AboutStripImage {
  path: string;
  cropTop: boolean;
}

export interface AboutContent {
  bioParagraphs: string[];
  portraitImage: string;
  stripImages: AboutStripImage[];
  socialLinks: AboutSocialLink[];
}

const DATA_FILE = 'src/data/aboutContent.json';
const IMAGE_DIR = 'public/assets/about-web';
const IMAGE_PREFIX = '/assets/about-web';

export const ABOUT_SCHEMA: FieldSchema[] = [
  {
    key: 'bioParagraphs',
    label: 'Bio paragraphs',
    type: 'array',
    itemLabel: 'Paragraph',
    fields: [{ key: 'value', label: 'Text', type: 'textarea', required: true }],
  },
  {
    key: 'socialLinks',
    label: 'Social links',
    type: 'array',
    itemLabel: 'Social link',
    fields: [
      {
        key: 'iconClass',
        label: 'Icon',
        type: 'select',
        required: true,
        options: [
          { value: 'social-link-icon-instagram', label: 'Instagram' },
          { value: 'social-link-icon-imdb', label: 'IMDb' },
          { value: 'social-link-icon-youtube', label: 'YouTube' },
          { value: 'social-link-icon-bandcamp', label: 'Bandcamp' },
        ],
      },
      { key: 'ariaLabel', label: 'Label', type: 'text', required: true },
      { key: 'href', label: 'URL', type: 'url', required: true },
    ],
  },
];

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(REPO_ROOT, 'admin/tmp-uploads'),
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

function slugFromPath(imgPath: string, fallback: string): string {
  return imgPath ? path.basename(imgPath, path.extname(imgPath)) : fallback;
}

export const aboutRouter = Router();

aboutRouter.get('/', (_req, res) => {
  res.json({ schema: ABOUT_SCHEMA, data: loadJson<AboutContent>(DATA_FILE) });
});

aboutRouter.put('/', upload.any(), async (req, res) => {
  try {
    const raw = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : null;
    if (!raw || typeof raw !== 'object') {
      throw new Error('Missing content data.');
    }

    const existing = loadJson<AboutContent>(DATA_FILE);
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const findFile = (fieldname: string) => files.find((f) => f.fieldname === fieldname);
    const committedPaths = [DATA_FILE];

    const bioParagraphs: string[] = Array.isArray(raw.bioParagraphs)
      ? raw.bioParagraphs.map((p: unknown) => String(p)).filter((p: string) => p.trim() !== '')
      : existing.bioParagraphs;

    const socialLinks: AboutSocialLink[] = Array.isArray(raw.socialLinks) ? raw.socialLinks : existing.socialLinks;

    let portraitImage: string = typeof raw.portraitImage === 'string' ? raw.portraitImage : existing.portraitImage;
    const portraitFile = findFile('portraitImage');
    if (portraitFile) {
      const slug = slugFromPath(portraitImage, 'portrait-main');
      const currentAbsPath = portraitImage ? absoluteImagePath(IMAGE_DIR, portraitImage) : undefined;
      const resolved = resolveImagePath(IMAGE_DIR, IMAGE_PREFIX, slug, '.jpg', currentAbsPath);
      await compressAndSaveImage(portraitFile.path, resolved.absPath);
      portraitImage = resolved.imgPath;
      committedPaths.push(resolved.absPath);
    }
    if (!portraitImage) {
      throw new Error('Portrait image is required.');
    }

    if (!Array.isArray(raw.stripImages)) {
      throw new Error('stripImages must be a list.');
    }
    const stripImages: AboutStripImage[] = [];
    for (let i = 0; i < raw.stripImages.length; i += 1) {
      const row = raw.stripImages[i] ?? {};
      const existingPath = typeof row.path === 'string' ? row.path : '';
      const cropTop = row.cropTop === true;
      const file = findFile(`stripImages[${i}]`);
      if (file) {
        const slug = slugFromPath(existingPath, `about-strip-${i + 1}`);
        const currentAbsPath = existingPath ? absoluteImagePath(IMAGE_DIR, existingPath) : undefined;
        const resolved = resolveImagePath(IMAGE_DIR, IMAGE_PREFIX, slug, '.jpg', currentAbsPath);
        await compressAndSaveImage(file.path, resolved.absPath);
        stripImages.push({ path: resolved.imgPath, cropTop });
        committedPaths.push(resolved.absPath);
      } else if (existingPath) {
        stripImages.push({ path: existingPath, cropTop });
      } else {
        throw new Error(`Strip image ${i + 1} needs an uploaded image.`);
      }
    }

    const updated: AboutContent = { bioParagraphs, portraitImage, stripImages, socialLinks };
    saveJson(DATA_FILE, updated);

    const git = stageAndCommit(committedPaths, 'Update About page content');
    res.json({ data: updated, git });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});
