import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AdminEntry } from './types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '../..');
export const DATA_FILE = path.join(
  REPO_ROOT,
  'src/data/postProductionWork.json'
);

export function loadEntries(): AdminEntry[] {
  const raw = readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as AdminEntry[];
}

export function saveEntries(entries: AdminEntry[]): void {
  writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
}
